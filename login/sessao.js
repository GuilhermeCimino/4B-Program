function deslogar() {
  // Limpa absolutamente tudo o que o seu login salvou
  localStorage.removeItem("usuario");
  localStorage.removeItem("token");
  localStorage.removeItem("nomeUsuario"); // <-- ADICIONE ESSA LINHA AQUI!

  alert("Você saiu com segurança!");

  // Manda de volta para o login
  window.location.href = "../login/login.html";
}
window.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.querySelector(".btn-login");
  const btnSair = document.querySelector(".btn-sair");

  // Mudamos de "usuario" para "nomeUsuario" que é o que seu sistema salva!
  const usuarioLogado = localStorage.getItem("nomeUsuario");

  if (usuarioLogado) {
    // Se achou o nome do usuário, ele está logado!
    if (btnLogin) btnLogin.style.display = "none";
    if (btnSair) btnSair.style.display = "inline-block";
  } else {
    // Se retornou vazio (null), ninguém está logado.
    if (btnLogin) btnLogin.style.display = "inline-block";
    if (btnSair) btnSair.style.display = "none";
  }
});
