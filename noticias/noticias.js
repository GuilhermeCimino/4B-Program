// noticias.js - Versão Final Organizada

document.addEventListener("DOMContentLoaded", function() {
    // 1. Seleciona os elementos do modal
    const modal = document.getElementById('image-modal');
    const imgModal = document.getElementById("img-ampliada");
    const legendaModal = document.getElementById("legenda-modal");
    const spanFechar = document.querySelector(".fechar-modal");

    // 2. MUDANÇA AQUI: Seleciona APENAS as imagens pequenas das galerias
    // As imagens de capa (.noticia-img img) foram removidas daqui
    const imagensGaleria = document.querySelectorAll('.galeria-camisas img');

    // 3. Adiciona o evento de clique para abrir o modal
    imagensGaleria.forEach(function(img) {
        img.onclick = function() {
            modal.style.display = "flex";    // Mostra o modal usando flex para centralizar
            imgModal.src = this.src;         // Pega o caminho da miniatura clicada
            legendaModal.innerHTML = this.alt || "Manto Rosonero"; 
            
            // Impede o scroll da página de fundo para não perder a posição
            document.body.style.overflow = 'hidden'; 
        }
    });

    // 4. Função centralizada para fechar o modal
    function fecharModal() {
        modal.style.display = "none";
        document.body.style.overflow = 'auto'; // Reativa o scroll da página
    }

    // 5. Evento: Clicar no botão 'X'
    if (spanFechar) {
        spanFechar.onclick = fecharModal;
    }

    // 6. Evento: Clicar na área escura (fora da imagem)
    window.onclick = function(event) {
        if (event.target == modal) {
            fecharModal();
        }
    }

    // 7. Evento: Pressionar a tecla 'Esc' (Acessibilidade profissional)
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            fecharModal();
        }
    });
});