// 1. Verifica se o usuário tem o token no navegador
const token = localStorage.getItem("token");
const nomeUsuario = localStorage.getItem("nomeUsuario");

// 2. Se NÃO tiver o token, manda de volta para a tela de login
if (!token) {
  alert("Você precisa estar logado para acessar esta página!");
  window.location.href = "../login/login.html";
}

// 3. Se estiver logado, vamos procurar um elemento na tela para colocar o nome dele
// (Essa função roda assim que a página carregar)
window.addEventListener("load", () => {
  const elementoNome = document.getElementById("nome-usuario-logado");

  if (elementoNome && nomeUsuario) {
    elementoNome.textContent = `Olá, ${nomeUsuario}`;
  }
});

// 4. Função para deslogar (Sair)
function fazerLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("nomeUsuario");
  window.location.href = "../login/login.html";
}
