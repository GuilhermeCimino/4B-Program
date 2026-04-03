let saldo = 100.0;

const icones = ["⚽", "🏆", "💎", "⭐", "🎰", "👕"];

function carregarSaldo() {
  // Pegamos o ID do usuário logado que o seu login salvou no navegador
  const usuarioSalvo = localStorage.getItem("usuario");
  const userId = usuarioSalvo ? JSON.parse(usuarioSalvo).id : 1;

  // Batendo na rota certa do servidor passando o ID
  fetch(`http://localhost:3000/api/bets/saldo/${userId}`)
    .then((res) => res.json())
    .then((data) => {
      saldo = data.saldo;
      atualizarDisplaySaldo();
    })
    .catch((err) => console.log("Erro ao carregar saldo:", err));
}

// Chamar ao carregar a página

window.onload = carregarSaldo;

/* --- LÓGICA DO SLOTS (CAÇA-NÍQUEIS) --- */

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

  reels.forEach((reel) => reel.classList.add("girando"));

  setTimeout(() => {
    let resultados = [];

    reels.forEach((reel) => {
      reel.classList.remove("girando");

      let iconeSorteado = icones[Math.floor(Math.random() * icones.length)];

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

function processarResultadoSlots(resultados, feedback, apostaRealizada) {
  if (resultados[0] === resultados[1] && resultados[1] === resultados[2]) {
    let iconeVitorioso = resultados[0];

    let multiplicador =
      iconeVitorioso === "🏆" ? 10 : iconeVitorioso === "⚽" ? 5 : 3;

    let premio = apostaRealizada * multiplicador;

    saldo += premio;

    feedback.innerText = `GANHOU R$ ${premio.toFixed(2)}!`;

    feedback.style.color = "#44ff44";
  } else {
    feedback.innerText = "Não foi dessa vez.";

    feedback.style.color = "#aaaaaa";
  }
}

/* --- LÓGICA DO PINK CRASH (MULTIPLICADOR) --- */

let crashInterval;

let multiplicadorAtual = 1.0;

let pontoExplosao = 0;

let emJogoCrash = false;

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

  // A casa decide onde explode (Programado para a casa ganhar)

  pontoExplosao = (Math.random() * 4 + 1).toFixed(2);

  if (Math.random() < 0.15) pontoExplosao = 1.0; // 15% de chance de quebrar no início

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

function sacarCrash() {
  if (!emJogoCrash) return;

  const valorAposta = parseFloat(
    document.getElementById("valor-aposta-crash").value,
  );

  const ganho = valorAposta * multiplicadorAtual;

  saldo += ganho;

  finalizarCrash(true, ganho);
}

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

/* --- FUNÇÕES GERAIS (BANCO E PENHOR) --- */

function atualizarDisplaySaldo() {
  const display = document.getElementById("display-saldo");

  if (display) display.innerText = `R$ ${saldo.toFixed(2)}`;
}

function abrirPenhor() {
  const pawnShop = document.getElementById("pawn-shop");

  if (pawnShop) pawnShop.style.display = "block";

  // Bloqueia os dois jogos simultaneamente

  document.getElementById("btn-girar").disabled = true;

  document.getElementById("btn-iniciar-crash").disabled = true;
}

function venderBem(nome, valor, botao) {
  saldo += valor;

  atualizarDisplaySaldo();
  atualizarSaldoNoBanco(saldo);
  botao.classList.add("sold");

  botao.innerText = `VENDIDO: ${nome}`;

  botao.disabled = true;

  document.getElementById("pawn-feedback").innerText =
    `Você sacrificou seu ${nome.toLowerCase()} pelo jogo.`;

  // Reativa os jogos e esconde o penhor

  document.getElementById("btn-girar").disabled = false;

  document.getElementById("btn-iniciar-crash").disabled = false;

  document.getElementById("pawn-shop").style.display = "none";

  // Verifica se é o fim absoluto

  const itensRestantes = document.querySelectorAll(".btn-pawn:not(.sold)");

  if (itensRestantes.length === 0 && saldo < 1) {
    finalizarJogo();
  }
}

function finalizarJogo() {
  // Substitui o conteúdo principal pela tela de derrota

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

  // Resetar posições

  cavalos.forEach(
    (c) => (document.getElementById(c.id).style.transform = `translateX(0px)`),
  );

  const corridaInterval = setInterval(() => {
    cavalos.forEach((c) => {
      // Cada cavalo avança um valor aleatório (Simulando a "sorte")

      c.pos += Math.random() * 15;

      document.getElementById(c.id).style.transform = `translateX(${c.pos}px)`;
    });

    // Verifica se algum cavalo ganhou (ajuste o 250 dependendo da largura do card)

    let vencedor = cavalos.find((c) => c.pos >= 260);

    if (vencedor) {
      clearInterval(corridaInterval);

      racing = false;

      btn.disabled = false;

      const numVencedor = parseInt(vencedor.id.replace("horse", ""));

      if (numVencedor === cavaloEscolhido) {
        const premio = aposta * 3; // Triplica o valor (Odd 3.0)

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

    .then((data) => {
      console.log(data);
    });

  function apostar(fixtureId) {
    fetch("http://localhost:3000/bets", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        userId: 1,

        fixtureId,

        valor: 100,
      }),
    });
  }
}

const btnApostar = document.getElementById("btnApostar");

const secaoFutebol = document.getElementById("secao-futebol");

const painelJogos = document.querySelector(".painel-apostas");

btnApostar.onclick = () => {
  painelJogos.style.display = "none";

  document.querySelector("section.card-aposta").style.display = "none"; // Ocultar o card de apostar

  secaoFutebol.style.display = "block";

  carregarJogos();
};

function voltarApostas() {
  secaoFutebol.style.display = "none";

  painelJogos.style.display = "flex";

  document.querySelector("section.card-aposta").style.display = "block"; // Mostrar o card de apostar
}

function carregarJogos() {
  fetch("http://localhost:3000/api/fixtures")
    .then((res) => res.json())
    .then((jogos) => {
      const container = document.getElementById("jogos");
      container.innerHTML = "";

      // 1. Agrupar os jogos por data
      const grupos = {};

      jogos.forEach((jogo) => {
        const data = new Date(jogo.fixture.date).toLocaleDateString("pt-BR");
        if (!grupos[data]) {
          grupos[data] = [];
        }
        grupos[data].push(jogo);
      });

      // 2. Renderizar os cards do carrossel (agrupados por data)
      for (let data in grupos) {
        const card = document.createElement("div");
        card.classList.add("card-carrossel");

        // Cabeçalho com a data
        let htmlConteudo = `
                    <div class="card-header">
                        <h3>${data}</h3>
                    </div>
                    <div class="card-body">
                `;

        // Lista de confrontos daquele dia
        grupos[data].forEach((jogo) => {
          htmlConteudo += `
                        <div class="confronto">
                            <span class="time">${jogo.teams.home.name}</span>
                            <span class="vs">vs</span>
                            <span class="time">${jogo.teams.away.name}</span>
                        </div>
                        <button class="btn-apostar-jogo" onclick="apostar(${jogo.fixture.id})">
                            Apostar
                        </button>
                    `;
        });

        htmlConteudo += `</div>`;
        card.innerHTML = htmlConteudo;
        container.appendChild(card);
      }
    })
    .catch((err) => console.error("Erro ao buscar jogos:", err));
}
function resolverApostas() {
  // 1. Pegamos o nome do usuário logado no navegador
  const usuarioLogado = localStorage.getItem("nomeUsuario");

  if (!usuarioLogado) {
    alert("Você precisa estar logado para resolver as apostas!");
    return;
  } // 2. No seu TCC, se o seu back-end usar o ID numérico (como 1),
  // e não o nome de texto, precisamos garantir que estamos mandando o dado certo.
  // Vou colocar o '1' como padrão aqui caso seu back-end espere um número ID.

  const userId = localStorage.getItem("userId") || 1; // 3. Agora passamos o ID no final da URL

  fetch(`http://localhost:3000/api/bets/resolver/${userId}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Não foi possível resolver as apostas no servidor.");
      }
      return res.json();
    })
    .then((data) => {
      saldo = data.saldo;

      atualizarDisplaySaldo();

      alert("Apostas resolvidas! Novo saldo: R$ " + data.saldo.toFixed(2));
    })
    .catch((err) => alert("Erro ao resolver apostas: " + err.message));
}

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
  const userId = usuarioSalvo ? JSON.parse(usuarioSalvo).id : 1; // Se não achar, usa o ID 1 como fallback

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

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      fixtureId: window.currentFixtureId,

      valor,

      escolha: opcaoSelecionada,
      userId: userId,
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
function atualizarSaldoNoBanco(novoSaldo) {
  const usuarioSalvo = localStorage.getItem("usuario");
  const userId = usuarioSalvo ? JSON.parse(usuarioSalvo).id : 1;

  fetch("http://localhost:3000/api/bets/atualizar-saldo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: userId,
      saldo: novoSaldo,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Saldo sincronizado no banco de dados.");
    })
    .catch((err) => console.error("Erro ao sincronizar saldo:", err));
}
