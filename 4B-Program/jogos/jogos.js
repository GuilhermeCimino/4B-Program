const container = document.getElementById("jogos");
let jogos = [];

// Buscar partidas
async function getMatches() {
  try {
    const res = await fetch("http://localhost:3000/api/fixtures");
    const data = await res.json();

    // Salvar no localStorage
    localStorage.setItem("matches", JSON.stringify(data));

    jogos = data;

    renderMatches();
  } catch (err) {
    console.error("Erro ao buscar jogos:", err);
  }
}

// Renderizar partidas
const renderMatches = () => {
  container.innerHTML = "";

  // Agrupar jogos por data
  const grupos = {};

  jogos.forEach((jogo) => {
    const data = new Date(jogo.fixture.date).toLocaleDateString("pt-BR");

    if (!grupos[data]) {
      grupos[data] = [];
    }

    grupos[data].push(jogo);
  });

  // Renderizar cards
  for (let data in grupos) {
    const card = document.createElement("div");
    card.classList.add("card-carrossel");

    let htmlConteudo = `
      <div class="card-header">
        <h3>${data}</h3>
      </div>

      <div class="card-body">
    `;

    grupos[data].forEach((jogo) => {
      htmlConteudo += `
        <div class="confronto">
          <span class="time">${jogo.teams.home.name}</span>
          <span class="vs">vs</span>
          <span class="time">${jogo.teams.away.name}</span>
        </div>
      `;
    });

    htmlConteudo += `</div>`;

    card.innerHTML = htmlConteudo;

    container.appendChild(card);
  }
};

// Inicialização
const localMatches = localStorage.getItem("matches");

if (localMatches) {
  jogos = JSON.parse(localMatches);
  renderMatches();
} else {
  getMatches();
}

console.log(jogos);
