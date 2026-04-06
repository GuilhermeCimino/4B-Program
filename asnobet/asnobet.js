let saldo = 100.0;

// Ícones disponíveis para o slots
const icones = ["⚽", "🏆", "💎", "⭐", "🎰", "👕"];

/* ---------------------- FUNÇÕES DE SALDO ---------------------- */

// Carrega o saldo do usuário ao iniciar a página
function carregarSaldo() {
  const usuarioSalvo = localStorage.getItem("usuario");
  const userId = usuarioSalvo ? JSON.parse(usuarioSalvo).id : 1;

  fetch(`http://localhost:3000/api/bets/saldo/${userId}`)
    .then((res) => res.json())
    .then((data) => {
      saldo = data.saldo;
      atualizarDisplaySaldo();
    })
    .catch((err) => console.log("Erro ao carregar saldo:", err));
}

window.onload = carregarSaldo;

// Atualiza o display do saldo na interface
function atualizarDisplaySaldo() {
  const display = document.getElementById("display-saldo");
  if (display) display.innerText = `R$ ${saldo.toFixed(2)}`;
}

// Sincroniza o saldo atual com o backend
function atualizarSaldoNoBanco(novoSaldo) {
  const usuarioSalvo = localStorage.getItem("usuario");
  const userId = usuarioSalvo ? JSON.parse(usuarioSalvo).id : 1;

  fetch("http://localhost:3000/api/bets/atualizar-saldo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, saldo: novoSaldo }),
  })
    .then((res) => res.json())
    .then(() => console.log("Saldo sincronizado no banco de dados."))
    .catch((err) => console.error("Erro ao sincronizar saldo:", err));
}

/* ---------------------- LÓGICA DO SLOTS (CAÇA-NÍQUEIS) ---------------------- */

// Executa a rotação dos reels
function girarSlots() {
  const inputAposta = document.getElementById("valor-aposta");
  const valorAposta = parseFloat(inputAposta.value);
  const btn = document.getElementById("btn-girar");
  const feedback = document.getElementById("slots-feedback");
  const reels = [
    document.getElementById("reel1"),
    document.getElementById("reel2"),
    document.getElementById("reel3"),
  ];

  // Valida aposta
  if (isNaN(valorAposta) || valorAposta <= 0) {
    feedback.innerText = "Insira um valor válido!";
    feedback.style.color = "#ff4444";
    return;
  }

  if (saldo < valorAposta) {
    feedback.innerText = "Saldo insuficiente!";
    if (saldo < 1) abrirPenhor();
    return;
  }

  saldo -= valorAposta;
  atualizarDisplaySaldo();
  btn.disabled = true;
  feedback.innerText = "";

  // Inicia animação
  reels.forEach((reel) => reel.classList.add("girando"));

  setTimeout(() => {
    let resultados = [];

    reels.forEach((reel) => {
      reel.classList.remove("girando");
      const iconeSorteado = icones[Math.floor(Math.random() * icones.length)];
      reel.innerText = iconeSorteado;
      resultados.push(iconeSorteado);
    });

    processarResultadoSlots(resultados, feedback, valorAposta);
    btn.disabled = false;
    atualizarDisplaySaldo();
    atualizarSaldoNoBanco(saldo);
    if (saldo < 1) abrirPenhor();
  }, 1500);
}

// Processa os resultados do slots
function processarResultadoSlots(resultados, feedback, apostaRealizada) {
  if (resultados[0] === resultados[1] && resultados[1] === resultados[2]) {
    const iconeVitorioso = resultados[0];
    const multiplicador =
      iconeVitorioso === "🏆" ? 10 : iconeVitorioso === "⚽" ? 5 : 3;
    const premio = apostaRealizada * multiplicador;
    saldo += premio;
    feedback.innerText = `GANHOU R$ ${premio.toFixed(2)}!`;
    feedback.style.color = "#44ff44";
  } else {
    feedback.innerText = "Não foi dessa vez.";
    feedback.style.color = "#aaaaaa";
  }
}

/* ---------------------- LÓGICA DO PINK CRASH ---------------------- */

let crashInterval;
let multiplicadorAtual = 1.0;
let pontoExplosao = 0;
let emJogoCrash = false;

// Inicia o jogo Crash
function iniciarCrash() {
  const inputAposta = document.getElementById("valor-aposta-crash");
  const valorAposta = parseFloat(inputAposta.value);
  const btnIniciar = document.getElementById("btn-iniciar-crash");
  const btnSacar = document.getElementById("btn-sacar-crash");
  const display = document.getElementById("crash-multiplier");
  const feedback = document.getElementById("crash-feedback");

  if (isNaN(valorAposta) || valorAposta <= 0 || emJogoCrash) return;
  if (saldo < valorAposta) {
    feedback.innerText = "Saldo insuficiente!";
    if (saldo < 1) abrirPenhor();
    return;
  }

  pontoExplosao = (Math.random() * 4 + 1).toFixed(2);
  if (Math.random() < 0.15) pontoExplosao = 1.0; // Chance de explodir no início

  saldo -= valorAposta;
  atualizarDisplaySaldo();
  emJogoCrash = true;
  multiplicadorAtual = 1.0;
  display.classList.remove("exploded");
  feedback.innerText = "Foguete subindo...";
  btnIniciar.style.display = "none";
  btnSacar.style.display = "inline-block";

  crashInterval = setInterval(() => {
    multiplicadorAtual += 0.02 * (multiplicadorAtual / 1.5);
    display.innerText = multiplicadorAtual.toFixed(2) + "x";

    if (multiplicadorAtual >= pontoExplosao) {
      finalizarCrash(false);
    }
  }, 100);
}

// Sacar ganhos antes da explosão
function sacarCrash() {
  if (!emJogoCrash) return;
  const valorAposta = parseFloat(
    document.getElementById("valor-aposta-crash").value,
  );
  const ganho = valorAposta * multiplicadorAtual;
  saldo += ganho;
  finalizarCrash(true, ganho);
}

// Finaliza o Crash
function finalizarCrash(ganhou, valorGanho) {
  clearInterval(crashInterval);
  emJogoCrash = false;
  const display = document.getElementById("crash-multiplier");
  const feedback = document.getElementById("crash-feedback");
  const btnIniciar = document.getElementById("btn-iniciar-crash");
  const btnSacar = document.getElementById("btn-sacar-crash");

  btnIniciar.style.display = "inline-block";
  btnSacar.style.display = "none";

  if (ganhou) {
    feedback.innerText = `SACOU! Ganhou R$ ${valorGanho.toFixed(2)}`;
    feedback.style.color = "#44ff44";
  } else {
    display.innerText = "BOOM! " + pontoExplosao + "x";
    display.classList.add("exploded");
    feedback.innerText = "Explodiu antes de você sacar.";
    feedback.style.color = "#ff4444";
    if (saldo < 1) abrirPenhor();
  }

  atualizarDisplaySaldo();
  atualizarSaldoNoBanco(saldo);
}

/* ---------------------- FUNÇÕES DE PENHOR ---------------------- */

// Abre o penhor e bloqueia jogos
function abrirPenhor() {
  const pawnShop = document.getElementById("pawn-shop");
  if (pawnShop) pawnShop.style.display = "block";

  document.getElementById("btn-girar").disabled = true;
  document.getElementById("btn-iniciar-crash").disabled = true;
}

// Vender um bem e atualizar saldo
function venderBem(nome, valor, botao) {
  saldo += valor;
  atualizarDisplaySaldo();
  atualizarSaldoNoBanco(saldo);
  botao.classList.add("sold");
  botao.innerText = `VENDIDO: ${nome}`;
  botao.disabled = true;

  document.getElementById("pawn-feedback").innerText =
    `Você sacrificou seu ${nome.toLowerCase()} pelo jogo.`;

  document.getElementById("btn-girar").disabled = false;
  document.getElementById("btn-iniciar-crash").disabled = false;
  document.getElementById("pawn-shop").style.display = "none";

  const itensRestantes = document.querySelectorAll(".btn-pawn:not(.sold)");
  if (itensRestantes.length === 0 && saldo < 1) finalizarJogo();
}

// Tela de derrota definitiva
function finalizarJogo() {
  const mainArea = document.querySelector("main") || document.body;
  mainArea.innerHTML = `
        <div style="padding: 100px 20px; text-align: center; background: #000; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <h2 style="color: #ff4444; font-size: 3.5rem; margin-bottom: 20px; text-shadow: 0 0 20px rgba(255,0,0,0.5);">PERDEU TUDO</h2>
            <p style="font-size: 1.3rem; color: #fff; max-width: 600px;">Você vendeu cada bem pessoal e perdeu cada centavo. O vício não deixou sobrar nada.</p>
            <p style="color: #777; margin-top: 20px; font-style: italic;">Na vida real, o tempo e as relações perdidas não têm botão de reset.</p>
            <button onclick="window.location.reload()" class="btn-cta" style="margin-top: 40px; background: #fff; color: #000; border: none; padding: 15px 40px; font-weight: bold; cursor: pointer; border-radius: 5px;">TENTAR RECOMEÇAR A VIDA</button>
        </div>
    `;
}

/* ---------------------- CORRIDA DE CAVALOS ---------------------- */

let racing = false;

function iniciarCorrida() {
  const aposta = parseFloat(
    document.getElementById("valor-aposta-horse").value,
  );
  const cavaloEscolhido = parseInt(
    document.getElementById("cavalo-escolhido").value,
  );
  const feedback = document.getElementById("horse-feedback");
  const btn = document.getElementById("btn-correr");

  if (saldo < aposta || racing) return;
  if (cavaloEscolhido < 1 || cavaloEscolhido > 3) {
    feedback.innerText = "Escolha cavalo 1, 2 ou 3!";
    return;
  }

  saldo -= aposta;
  atualizarDisplaySaldo();
  racing = true;
  btn.disabled = true;
  feedback.innerText = "E dada a largada!";

  const cavalos = [
    { id: "horse1", pos: 0 },
    { id: "horse2", pos: 0 },
    { id: "horse3", pos: 0 },
  ];

  cavalos.forEach(
    (c) => (document.getElementById(c.id).style.transform = `translateX(0px)`),
  );

  const corridaInterval = setInterval(() => {
    cavalos.forEach((c) => {
      c.pos += Math.random() * 15;
      document.getElementById(c.id).style.transform = `translateX(${c.pos}px)`;
    });

    let vencedor = cavalos.find((c) => c.pos >= 260);
    if (vencedor) {
      clearInterval(corridaInterval);
      racing = false;
      btn.disabled = false;

      const numVencedor = parseInt(vencedor.id.replace("horse", ""));
      if (numVencedor === cavaloEscolhido) {
        const premio = aposta * 3;
        saldo += premio;
        feedback.innerText = `🏆 CAVALO ${numVencedor} VENCEU! Você ganhou R$ ${premio.toFixed(2)}`;
        feedback.style.color = "#44ff44";
      } else {
        feedback.innerText = `Derrota! O cavalo ${numVencedor} chegou primeiro.`;
        feedback.style.color = "#ff4444";
        if (saldo < 1) abrirPenhor();
      }

      atualizarDisplaySaldo();
      atualizarSaldoNoBanco(saldo);
    }
  }, 50);

  fetch("http://localhost:3000/api/fixtures")
    .then((res) => res.json())
    .then((data) => console.log(data));
}

/* ---------------------- APOSTAS DE FUTEBOL ---------------------- */

const btnApostar = document.getElementById("btnApostar");
const secaoFutebol = document.getElementById("secao-futebol");
const painelJogos = document.querySelector(".painel-apostas");

// Abre a seção de jogos de futebol
btnApostar.onclick = () => {
  painelJogos.style.display = "none";
  document.querySelector("section.card-aposta").style.display = "none";
  secaoFutebol.style.display = "block";
  carregarJogos();
};

// Volta para a tela principal de apostas
function voltarApostas() {
  secaoFutebol.style.display = "none";
  painelJogos.style.display = "flex";
  document.querySelector("section.card-aposta").style.display = "block";
}

// Carrega jogos do backend e renderiza cards
function carregarJogos() {
  fetch("http://localhost:3000/api/fixtures")
    .then((res) => res.json())
    .then((jogos) => {
      const container = document.getElementById("jogos");
      container.innerHTML = "";

      const grupos = {};
      jogos.forEach((jogo) => {
        const data = new Date(jogo.fixture.date).toLocaleDateString("pt-BR");
        if (!grupos[data]) grupos[data] = [];
        grupos[data].push(jogo);
      });

      for (let data in grupos) {
        const card = document.createElement("div");
        card.classList.add("card-carrossel");

        let htmlConteudo = `<div class="card-header"><h3>${data}</h3></div><div class="card-body">`;

        grupos[data].forEach((jogo) => {
          htmlConteudo += `
                        <div class="confronto">
                            <span class="time">${jogo.teams.home.name}</span>
                            <span class="vs">vs</span>
                            <span class="time">${jogo.teams.away.name}</span>
                        </div>
                        <button class="btn-apostar-jogo" onclick="apostar(${jogo.fixture.id})">Apostar</button>
                    `;
        });

        htmlConteudo += `</div>`;
        card.innerHTML = htmlConteudo;
        container.appendChild(card);
      }
    })
    .catch((err) => console.error("Erro ao buscar jogos:", err));
}

// Modal de apostas
let opcaoSelecionada = null;
function apostar(fixtureId) {
  window.currentFixtureId = fixtureId;
  opcaoSelecionada = null;
  document.getElementById("valor-aposta-modal").value = "";
  document
    .querySelectorAll(".opcao-btn")
    .forEach((btn) => btn.classList.remove("selected"));
  document.getElementById("modal-aposta").style.display = "flex";
}

function selecionarOpcao(opcao) {
  opcaoSelecionada = opcao;
  document
    .querySelectorAll(".opcao-btn")
    .forEach((btn) => btn.classList.remove("selected"));
  document.getElementById("opcao-" + opcao).classList.add("selected");
}

function finalizarAposta() {
  const valor = parseFloat(document.getElementById("valor-aposta-modal").value);
  const usuarioSalvo = localStorage.getItem("usuario");
  const userId = usuarioSalvo ? JSON.parse(usuarioSalvo).id : 1;

  if (!opcaoSelecionada) {
    alert("Selecione uma opção!");
    return;
  }
  if (isNaN(valor) || valor <= 0) {
    alert("Insira um valor válido!");
    return;
  }
  if (saldo < valor) {
    alert("Saldo insuficiente!");
    fecharModal();
    return;
  }

  fetch("http://localhost:3000/api/bets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fixtureId: window.currentFixtureId,
      valor,
      escolha: opcaoSelecionada,
      userId,
    }),
  })
    .then((res) => res.json())
    .then((resp) => {
      if (resp.erro) {
        alert(resp.erro);
      } else {
        saldo = resp.saldo;
        atualizarDisplaySaldo();
        alert("Aposta feita! Novo saldo: R$ " + resp.saldo.toFixed(2));
      }
      fecharModal();
    })
    .catch((err) => {
      alert("Erro ao fazer aposta: " + err.message);
      fecharModal();
    });
}

function fecharModal() {
  document.getElementById("modal-aposta").style.display = "none";
}

// Resolver apostas pendentes
function resolverApostas() {
  const usuarioLogado = localStorage.getItem("nomeUsuario");
  if (!usuarioLogado) {
    alert("Você precisa estar logado para resolver as apostas!");
    return;
  }
  const userId = localStorage.getItem("userId") || 1;

  fetch(`http://localhost:3000/api/bets/resolver/${userId}`)
    .then((res) => {
      if (!res.ok)
        throw new Error("Não foi possível resolver as apostas no servidor.");
      return res.json();
    })
    .then((data) => {
      saldo = data.saldo;
      atualizarDisplaySaldo();
      alert("Apostas resolvidas! Novo saldo: R$ " + data.saldo.toFixed(2));
    })
    .catch((err) => alert("Erro ao resolver apostas: " + err.message));
}
