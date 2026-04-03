const express = require("express");
const router = express.Router();
const db = require("../database"); // Puxa a sua conexão do SQLite
const { getFixtures } = require("../services/apiFootball");

let apostasTemporarias = [];

// =================== FAZER UMA APOSTA ===================
router.post("/", (req, res) => {
  const { fixtureId, valor, escolha, userId } = req.body;

  // Busca o saldo atual do usuário no banco de dados
  db.get(
    "SELECT saldo FROM usuarios WHERE id = ?",
    [userId],
    (err, usuario) => {
      if (err || !usuario) {
        return res
          .status(500)
          .json({ erro: "Usuário não encontrado ou erro no banco." });
      }

      const saldoAtual = usuario.saldo;

      // Verifica se o saldo é suficiente
      if (valor > saldoAtual) {
        return res.json({ erro: "Saldo insuficiente para essa jogada!" });
      }

      const novoSaldo = saldoAtual - valor;

      // Atualiza o saldo diretamente no SQLite
      db.run(
        "UPDATE usuarios SET saldo = ? WHERE id = ?",
        [novoSaldo, userId],
        (errUpdate) => {
          if (errUpdate) {
            return res.status(500).json({ erro: "Erro ao atualizar o saldo." });
          }

          apostasTemporarias.push({
            userId,
            fixtureId,
            valor,
            escolha,
            resolvida: false,
          });

          res.json({ sucesso: true, saldo: novoSaldo });
        },
      );
    },
  );
});

// =================== BUSCAR SALDO ATUAL ===================
router.get("/saldo/:userId", (req, res) => {
  const userId = req.params.userId;

  db.get(
    "SELECT saldo FROM usuarios WHERE id = ?",
    [userId],
    (err, usuario) => {
      if (err || !usuario) {
        return res.status(404).json({ erro: "Usuário não encontrado." });
      }
      res.json({ saldo: usuario.saldo });
    },
  );
});

// =================== RESOLVER APOSTAS ===================
router.get("/resolver/:userId", async (req, res) => {
  const userId = req.params.userId;
  const jogos = await getFixtures();

  db.get(
    "SELECT saldo FROM usuarios WHERE id = ?",
    [userId],
    async (err, usuario) => {
      if (err || !usuario) {
        return res.status(500).json({ erro: "Usuário não encontrado." });
      }

      let saldoAtualizado = usuario.saldo;

      apostasTemporarias.forEach((aposta) => {
        if (aposta.userId !== parseInt(userId) || aposta.resolvida) return;

        const jogo = jogos.find((j) => j.fixture.id === aposta.fixtureId);
        if (!jogo) return;

        const resultado =
          jogo.goals.home > jogo.goals.away
            ? "casa"
            : jogo.goals.home < jogo.goals.away
              ? "fora"
              : "empate";

        if (resultado === aposta.escolha) {
          saldoAtualizado += aposta.valor * 2;
        }

        aposta.resolvida = true;
      });

      // Salva o resultado final do saldo no banco de dados
      db.run(
        "UPDATE usuarios SET saldo = ? WHERE id = ?",
        [saldoAtualizado, userId],
        (errUpdate) => {
          if (errUpdate) {
            return res.status(500).json({ erro: "Erro ao salvar novo saldo." });
          }
          res.json({ saldo: saldoAtualizado });
        },
      );
    },
  );
});
// =================== ATUALIZAR SALDO (MINI-JOGOS E PENHOR) ===================
router.post("/atualizar-saldo", (req, res) => {
  const { userId, saldo } = req.body;

  if (!userId || saldo === undefined) {
    return res
      .status(400)
      .json({ erro: "Dados incompletos (userId ou saldo faltando)." });
  }

  // Atualiza o saldo do usuário diretamente no banco SQLite
  db.run(
    "UPDATE usuarios SET saldo = ? WHERE id = ?",
    [saldo, userId],
    (err) => {
      if (err) {
        console.error("Erro ao atualizar saldo no banco:", err);
        return res
          .status(500)
          .json({ erro: "Erro ao atualizar o saldo no banco de dados." });
      }
      res.json({ sucesso: true, saldo: saldo });
    },
  );
});
module.exports = router;
