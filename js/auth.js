const Autenticacao = (() => {
    const { armazenamento, chaves, utilitarios, dados } = Aplicativo;

    const sessaoAtiva = () => {
        const sessao = armazenamento.ler(chaves.sessao, null);
        const usuario = dados.usuario.obter();
        return Boolean(sessao && sessao.ativa && usuario && sessao.email === usuario.email);
    };

    const iniciarSessao = email => armazenamento.gravar(chaves.sessao, { ativa: true, email });

    const sair = () => {
        armazenamento.remover(chaves.sessao);
        window.location.assign('entrar.html');
    };

    const criarConta = informacoes => {
        const usuario = {
            nome: informacoes.nome,
            email: informacoes.email,
            senha: utilitarios.resumirSenha(informacoes.senha),
            dataCriacao: utilitarios.hojeIso()
        };
        if (!dados.usuario.salvar(usuario)) {
            return false;
        }
        return iniciarSessao(usuario.email);
    };

    const entrar = (email, senha) => {
        const usuario = dados.usuario.obter();
        if (!usuario || !usuario.senha) {
            return { sucesso: false, campo: 'senha', mensagem: 'Nenhuma conta criada neste navegador. Crie sua conta primeiro.' };
        }
        if (usuario.email !== email || usuario.senha !== utilitarios.resumirSenha(senha)) {
            return { sucesso: false, campo: 'senha', mensagem: 'Confira seu e-mail e sua senha.' };
        }
        iniciarSessao(email);
        return { sucesso: true };
    };

    const mostrarErro = (id, texto) => {
        const mensagem = document.getElementById(`erro-${id}`);
        const campo = document.getElementById(id);
        if (mensagem) {
            mensagem.textContent = texto;
        }
        if (campo) {
            if (texto) {
                campo.setAttribute('aria-invalid', 'true');
            } else {
                campo.removeAttribute('aria-invalid');
            }
        }
    };

    const nivelDaSenha = senha => {
        const temTamanho = senha.length >= 8 ? 1 : 0;
        const temLetraENumero = /[a-zA-Z]/.test(senha) && /\d/.test(senha) ? 1 : 0;
        const temForca = senha.length >= 12 || /[^\w\s]/.test(senha) ? 1 : 0;
        return temTamanho + temLetraENumero + temForca;
    };

    const prepararFormularioEntrada = () => {
        const formulario = document.getElementById('formulario-entrada');
        if (!formulario) {
            return;
        }
        formulario.addEventListener('submit', evento => {
            evento.preventDefault();
            ['email', 'senha'].forEach(id => mostrarErro(id, ''));
            const email = document.getElementById('email').value.trim().toLowerCase();
            const senha = document.getElementById('senha').value;
            if (!utilitarios.validarEmail(email)) {
                mostrarErro('email', 'Digite um e-mail válido.');
                document.getElementById('email').focus();
                return;
            }
            if (!senha) {
                mostrarErro('senha', 'Digite sua senha.');
                document.getElementById('senha').focus();
                return;
            }
            const resultado = entrar(email, senha);
            if (!resultado.sucesso) {
                mostrarErro(resultado.campo, resultado.mensagem);
                return;
            }
            window.location.assign('inicio.html');
        });
    };

    const prepararFormularioCadastro = () => {
        const formulario = document.getElementById('formulario-conta');
        if (!formulario) {
            return;
        }
        const campos = ['nome', 'email', 'senha', 'confirmacao', 'termos'];
        document.getElementById('senha').addEventListener('input', evento => {
            const valor = evento.target.value;
            document.getElementById('forca-senha').dataset.nivel = String(valor ? nivelDaSenha(valor) : 0);
        });
        formulario.addEventListener('submit', evento => {
            evento.preventDefault();
            campos.forEach(id => mostrarErro(id, ''));
            const nome = document.getElementById('nome').value.trim();
            const email = document.getElementById('email').value.trim().toLowerCase();
            const senha = document.getElementById('senha').value;
            const falhas = {};
            if (nome.length < 2) {
                falhas.nome = 'Digite seu nome.';
            }
            if (!utilitarios.validarEmail(email)) {
                falhas.email = 'Digite um e-mail válido.';
            }
            if (senha.length < 8) {
                falhas.senha = 'Use pelo menos 8 caracteres.';
            }
            if (document.getElementById('confirmacao').value !== senha) {
                falhas.confirmacao = 'As senhas não são iguais.';
            }
            if (!document.getElementById('termos').checked) {
                falhas.termos = 'Aceite os termos para continuar.';
            }
            const camposComErro = Object.keys(falhas);
            if (camposComErro.length) {
                camposComErro.forEach(id => mostrarErro(id, falhas[id]));
                document.getElementById(camposComErro[0]).focus();
                return;
            }
            if (!criarConta({ nome, email, senha })) {
                Aplicativo.interface.avisar('Não foi possível salvar a conta neste navegador.', 'erro');
                return;
            }
            window.location.assign('inicio.html');
        });
    };

    const ajustarPorSessao = () => {
        const ativa = sessaoAtiva();
        document.querySelectorAll('[data-somente-visitante]').forEach(elemento => {
            elemento.hidden = ativa;
        });
        document.querySelectorAll('[data-somente-usuario]').forEach(elemento => {
            elemento.hidden = !ativa;
        });
    };

    const iniciar = () => {
        if (document.body.dataset.protegida === 'sim' && !sessaoAtiva()) {
            window.location.replace('entrar.html');
            return;
        }
        if (document.body.dataset.somenteVisitante === 'sim' && sessaoAtiva()) {
            window.location.replace('inicio.html');
            return;
        }
        ajustarPorSessao();
        prepararFormularioEntrada();
        prepararFormularioCadastro();
        document.addEventListener('click', evento => {
            if (evento.target.closest('[data-acao-sair]')) {
                sair();
            }
        });
    };

    iniciar();

    return { sessaoAtiva, sair, usuarioAtual: dados.usuario.obter };
})();