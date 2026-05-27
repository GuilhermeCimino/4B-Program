function comprar(jogo, preco) {
    window.location.href = "../compra/compra.html?jogo=" 
        + encodeURIComponent(jogo) + 
        "&preco=" + preco;
}