document.addEventListener("DOMContentLoaded", () => {
  const botoes = document.querySelectorAll(".btn-comprar");

  botoes.forEach(botao => {
    botao.addEventListener("click", () => {
      alert("Ingresso adicionado ao carrinho! 🎟️");
    });
  });
});