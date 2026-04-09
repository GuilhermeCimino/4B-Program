const params = new URLSearchParams(window.location.search);
const jogo = params.get("jogo");
const preco = params.get("preco");

const info = document.getElementById("infoJogo");

if (jogo && preco) {
    info.innerText = `${jogo} - R$ ${preco}`;
} else {
    info.innerText = "Informações do ingresso não encontradas";
}