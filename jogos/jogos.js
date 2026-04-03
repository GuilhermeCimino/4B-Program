fetch("http://localhost:3000/api/fixtures")
  .then((res) => res.json())
  .then((jogos) => {
    const container = document.getElementById("jogos");
    container.innerHTML = ""; // Limpa os jogos estáticos de teste ("Jogo 1", "Jogo 2", etc.)

    // 1. Agrupar os jogos por data
    const grupos = {};

    jogos.forEach((jogo) => {
      const data = new Date(jogo.fixture.date).toLocaleDateString("pt-BR");

      if (!grupos[data]) {
        grupos[data] = [];
      }
      grupos[data].push(jogo);
    });

    // 2. Renderizar os cards do carrossel
    for (let data in grupos) {
      const card = document.createElement("div");
      card.classList.add("card-carrossel");

      // Cabeçalho do Card com a Data
      let htmlConteudo = `
                <div class="card-header">
                    <h3>${data}</h3>
                </div>
                <div class="card-body">
            `;

      // Lista de jogos daquele dia
      grupos[data].forEach((jogo) => {
        htmlConteudo += `
                    <div class="confronto">
                        <span class="time">${jogo.teams.home.name}</span>
                        <span class="vs">vs</span>
                        <span class="time">${jogo.teams.away.name}</span>
                    </div>
                `;
      });

      htmlConteudo += `</div>`; // Fecha a div card-body
      card.innerHTML = htmlConteudo;

      container.appendChild(card);
    }
  })
  .catch((err) => console.error("Erro ao buscar jogos:", err));
