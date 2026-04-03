// Isso garante que o código só rode DEPOIS que o config.js e o HTML carregarem
document.addEventListener("DOMContentLoaded", () => {
  const formCadastro = document.getElementById("form-cadastro");

  formCadastro.addEventListener("submit", (evento) => {
    evento.preventDefault(); // Impede a página de recarregar

    const nome = document.getElementById("nome-cadastro").value;
    const email = document.getElementById("email-cadastro").value;
    const senha = document.getElementById("senha-cadastro").value;
    const confirmaSenha = document.getElementById(
      "confirma-senha-cadastro",
    ).value;

    // Pequena validação de senha
    if (senha !== confirmaSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    const dadosCadastro = {
      nome: nome,
      email: email,
      senha: senha,
    };

    // Faz a requisição POST para a rota de cadastro usando a API_URL
    fetch("http://localhost:3000/api/auth/cadastro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosCadastro),
    })
      .then((res) => res.json())
      .then((resposta) => {
        if (
          resposta.mensagem === "Usuário cadastrado com sucesso!" ||
          resposta.token
        ) {
          alert("Cadastro realizado com sucesso!");
          window.location.href = "login.html";
        } else {
          alert(resposta.mensagem || "Erro ao cadastrar.");
        }
      })
      .catch((err) => {
        console.error("Erro ao cadastrar:", err);
        alert("Erro ao conectar com o servidor.");
      });
  });
});
