const params = new URLSearchParams(window.location.search);

const jogo = params.get("jogo");
const preco = params.get("preco");

const info = document.getElementById("infoJogo");

/* MOSTRA INFO DO JOGO */
if (jogo && preco) {

    info.innerText = `${jogo} - R$ ${preco}`;

} else {

    info.innerText = "Informações do ingresso não encontradas";

}

/* ABRIR POPUP */
function confirmarCompra() {

    document.getElementById("popup-confirmacao").style.display = "flex";

}

/* FECHAR POPUP */
function fecharPopup() {

    document.getElementById("popup-confirmacao").style.display = "none";

}