const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database"); // Puxa a sua conexão do SQLite

// =================== ROTA DE CADASTRO ===================
router.post("/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    // 1. Verifica se o e-mail já está cadastrado
    db.get(
      "SELECT id FROM usuarios WHERE email = ?",
      [email],
      async (err, linha) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ mensagem: "Erro ao consultar o banco de dados." });
        }

        if (linha) {
          return res
            .status(400)
            .json({ mensagem: "Este e-mail já está em uso." });
        }

        // 2. Criptografa a senha
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        // 3. Salva no banco (O saldo padrão de 100.00 já entra automático aqui!)
        db.run(
          "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
          [nome, email, senhaCriptografada],
          function (errInsert) {
            if (errInsert) {
              console.error(errInsert);
              return res
                .status(500)
                .json({ mensagem: "Erro ao cadastrar usuário." });
            }

            return res
              .status(201)
              .json({ mensagem: "Usuário cadastrado com sucesso!" });
          },
        );
      },
    );
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro interno no servidor." });
  }
});

// =================== ROTA DE LOGIN ===================
router.post("/login", (req, res) => {
  const { email, senha } = req.body;

  try {
    // 1. Busca o usuário pelo e-mail
    db.get(
      "SELECT * FROM usuarios WHERE email = ?",
      [email],
      async (err, usuario) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ mensagem: "Erro ao consultar o banco de dados." });
        }

        if (!usuario) {
          return res
            .status(400)
            .json({ mensagem: "E-mail ou senha incorretos." });
        }

        // 2. Compara a senha digitada com a criptografada no banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
          return res
            .status(400)
            .json({ mensagem: "E-mail ou senha incorretos." });
        }

        // 3. Gera o Token JWT
        const token = jwt.sign(
          { id: usuario.id },
          process.env.JWT_SECRET || "chave_secreta_padrao",
          {
            expiresIn: "1d",
          },
        );

        return res.json({
          mensagem: "Login bem-sucedido!",
          token,
          usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
        });
      },
    );
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro interno no servidor." });
  }
});

module.exports = router;
