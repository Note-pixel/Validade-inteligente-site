(() => {
    const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const sairDaPagina = destino => {
        if (reduzirMovimento) {
            destino();
            return;
        }
        document.documentElement.classList.add('saindo');
        setTimeout(destino, 180);
    };

    document.addEventListener('click', evento => {
        const voltar = evento.target.closest('[data-voltar]');
        if (voltar) {
            evento.preventDefault();
            const mesmoSite = document.referrer && new URL(document.referrer).origin === window.location.origin;
            sairDaPagina(() => {
                if (mesmoSite && window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.assign(voltar.dataset.alternativa || 'index.html');
                }
            });
            return;
        }
        const link = evento.target.closest('a[href]');
        if (!link || evento.defaultPrevented || evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || link.target) {
            return;
        }
        const endereco = new URL(link.href, window.location.href);
        if (endereco.origin !== window.location.origin) {
            return;
        }
        if (endereco.pathname === window.location.pathname && endereco.hash) {
            return;
        }
        evento.preventDefault();
        sairDaPagina(() => window.location.assign(endereco.href));
    });

    window.addEventListener('pageshow', evento => {
        if (evento.persisted) {
            document.documentElement.classList.remove('saindo');
        }
    });
})();