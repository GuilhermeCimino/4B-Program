const formLogin = document.getElementById("form-login");

formLogin.addEventListener("submit", (evento) => {
  evento.preventDefault(); // Impede a página de recarregar

  const email = document.getElementById("email-login").value;
  const senha = document.getElementById("senha-login").value;

  const dadosLogin = {
    email: email,
    senha: senha,
  };

  // 3. Faz a requisição POST para a rota de login
  fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dadosLogin),
  })
    .then((res) => res.json())
    .then((resposta) => {
      if (resposta.mensagem === "Login bem-sucedido!") {
        // GUARDANDO O LOGIN:
        // Salvamos o token e o nome do usuário no navegador para usar depois
        localStorage.setItem("token", resposta.token);
        localStorage.setItem("nomeUsuario", resposta.usuario.nome);

        alert(`Bem-vindo de volta, ${resposta.usuario.nome}!`);

        window.location.href = "../home.html";
      } else {
        alert(resposta.mensagem);
      }
    })
    .catch((err) => {
      console.error("Erro ao fazer login:", err);
      alert("Erro ao conectar com o servidor.");
    });
});
