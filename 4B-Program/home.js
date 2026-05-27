const video = document.getElementById('video-intro');
const container = document.getElementById('intro-container');

// verifica se já viu o vídeo nesta sessão
const jaViuIntro = sessionStorage.getItem("jaViuIntro");

if (jaViuIntro) {
    // já viu → não mostra nada
    container.style.display = 'none';
    document.body.style.overflow = 'auto';
} else {
    // não viu → roda o vídeo normalmente

    video.onended = function() {
        container.style.opacity = '0';

        setTimeout(() => {
            container.style.display = 'none';
            document.body.style.overflow = 'auto';

            // marca como visto nesta sessão
            sessionStorage.setItem("jaViuIntro", "true");
        }, 1000);
    };
}

