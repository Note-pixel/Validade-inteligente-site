const Aplicativo = (() => {
    const chaves = {
        usuario: 'validade:usuario',
        sessao: 'validade:sessao',
        preferencias: 'validade:preferencias',
        alimentos: 'validade:alimentos',
        historico: 'validade:historico',
        compras: 'validade:compras',
        receitasProprias: 'validade:receitasProprias'
    };

    const categorias = ['Laticínios', 'Carnes', 'Frutas e verduras', 'Padaria', 'Grãos e massas', 'Bebidas', 'Outros'];
    const locais = ['Geladeira', 'Armário', 'Freezer'];

    const caminhosImagens = {
        logo: '',
        avatar: '',
        despensaVazia: '',
        receitas: '',
        ajuda: '',
        erro: '',
        inicioApresentacao: '',
        categorias: {
            'Laticínios': '',
            'Carnes': '',
            'Frutas e verduras': '',
            'Padaria': '',
            'Grãos e massas': '',
            'Bebidas': '',
            'Outros': ''
        }
    };

    const armazenamento = {
        ler(chave, valorPadrao) {
            try {
                const bruto = localStorage.getItem(chave);
                return bruto === null ? valorPadrao : JSON.parse(bruto);
            } catch (erro) {
                return valorPadrao;
            }
        },
        gravar(chave, valor) {
            try {
                localStorage.setItem(chave, JSON.stringify(valor));
                return true;
            } catch (erro) {
                return false;
            }
        },
        remover(chave) {
            try {
                localStorage.removeItem(chave);
            } catch (erro) {
                return;
            }
        }
    };

    const utilitarios = {
        escaparHtml(texto) {
            const substituicoes = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
            return String(texto).replace(/[&<>"']/g, caractere => substituicoes[caractere]);
        },
        normalizarTexto(texto) {
            return String(texto).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        },
        gerarId() {
            return Date.now() + Math.floor(Math.random() * 1000);
        },
        formatarDataIso(data) {
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const dia = String(data.getDate()).padStart(2, '0');
            return `${data.getFullYear()}-${mes}-${dia}`;
        },
        hojeIso() {
            return utilitarios.formatarDataIso(new Date());
        },
        somarDias(quantidade) {
            const data = new Date();
            data.setDate(data.getDate() + quantidade);
            return utilitarios.formatarDataIso(data);
        },
        dataIsoValida(texto) {
            return /^\d{4}-\d{2}-\d{2}$/.test(texto) && !Number.isNaN(new Date(`${texto}T00:00:00`).getTime());
        },
        formatarDataBrasileira(iso) {
            const [ano, mes, dia] = iso.split('-');
            return `${dia}/${mes}/${ano}`;
        },
        diasParaVencer(iso) {
            const [ano, mes, dia] = iso.split('-').map(Number);
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            return Math.round((new Date(ano, mes - 1, dia) - hoje) / 86400000);
        },
        classificarValidade(dias) {
            if (dias < 0) {
                return { classe: 'situacao-vencido', chave: 'vencido', texto: dias === -1 ? 'Vencido há 1 dia' : `Vencido há ${-dias} dias`, anel: '!' };
            }
            if (dias === 0) {
                return { classe: 'situacao-breve', chave: 'breve', texto: 'Vence hoje', anel: 'Hoje' };
            }
            if (dias <= 3) {
                return { classe: 'situacao-breve', chave: 'breve', texto: `Vence em ${dias} ${dias === 1 ? 'dia' : 'dias'}`, anel: `${dias}d` };
            }
            if (dias <= 7) {
                return { classe: 'situacao-atencao', chave: 'atencao', texto: `Atenção · ${dias} dias`, anel: `${dias}d` };
            }
            return { classe: 'situacao-seguro', chave: 'seguro', texto: `Seguro · ${dias} dias`, anel: `${dias}d` };
        },
        validarEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        resumirSenha(texto) {
            let resumo = 5381;
            for (const caractere of texto) {
                resumo = ((resumo << 5) + resumo + caractere.charCodeAt(0)) | 0;
            }
            return String(resumo);
        }
    };

    const normalizarAlimento = bruto => {
        const valido = bruto && typeof bruto === 'object' && bruto.id && typeof bruto.nome === 'string' && utilitarios.dataIsoValida(bruto.validade);
        if (!valido) {
            return null;
        }
        return {
            id: bruto.id,
            nome: bruto.nome,
            quantidade: String(bruto.quantidade || '1 unidade'),
            categoria: categorias.includes(bruto.categoria) ? bruto.categoria : 'Outros',
            local: locais.includes(bruto.local) ? bruto.local : 'Geladeira',
            validade: bruto.validade,
            dataCadastro: utilitarios.dataIsoValida(bruto.dataCadastro) ? bruto.dataCadastro : utilitarios.hojeIso(),
            exemplo: Boolean(bruto.exemplo)
        };
    };

    const lerListaSegura = chave => {
        const lista = armazenamento.ler(chave, []);
        return Array.isArray(lista) ? lista : [];
    };

    const dados = {
        usuario: {
            obter() {
                const usuario = armazenamento.ler(chaves.usuario, null);
                return usuario && typeof usuario === 'object' ? usuario : null;
            },
            salvar(usuario) {
                return armazenamento.gravar(chaves.usuario, usuario);
            }
        },
        preferencias: {
            obter() {
                const padrao = { antecedenciaAlerta: 3, horarioLembrete: '18:00', receberAvisos: true };
                const salvas = armazenamento.ler(chaves.preferencias, {});
                return Object.assign(padrao, salvas && typeof salvas === 'object' ? salvas : {});
            },
            salvar(preferencias) {
                return armazenamento.gravar(chaves.preferencias, preferencias);
            }
        },
        alimentos: {
            listar() {
                return lerListaSegura(chaves.alimentos).map(normalizarAlimento).filter(Boolean);
            },
            salvarLista(lista) {
                return armazenamento.gravar(chaves.alimentos, lista);
            },
            buscar(id) {
                return dados.alimentos.listar().find(alimento => String(alimento.id) === String(id)) || null;
            },
            adicionar(informacoes) {
                const alimento = normalizarAlimento(Object.assign({}, informacoes, { id: utilitarios.gerarId(), dataCadastro: utilitarios.hojeIso() }));
                if (!alimento) {
                    return null;
                }
                dados.alimentos.salvarLista(dados.alimentos.listar().concat([alimento]));
                return alimento;
            },
            atualizar(id, informacoes) {
                let atualizado = null;
                const lista = dados.alimentos.listar().map(alimento => {
                    if (String(alimento.id) !== String(id)) {
                        return alimento;
                    }
                    atualizado = normalizarAlimento(Object.assign({}, alimento, informacoes, { id: alimento.id, exemplo: false }));
                    return atualizado || alimento;
                });
                dados.alimentos.salvarLista(lista);
                return atualizado;
            },
            excluir(id, motivo) {
                const alimento = dados.alimentos.buscar(id);
                if (!alimento) {
                    return null;
                }
                dados.alimentos.salvarLista(dados.alimentos.listar().filter(item => String(item.id) !== String(id)));
                if (motivo === 'consumido' || motivo === 'descartado') {
                    dados.historico.registrar(motivo, alimento);
                }
                return alimento;
            },
            ordenadosPorValidade() {
                return dados.alimentos.listar().sort((a, b) => utilitarios.diasParaVencer(a.validade) - utilitarios.diasParaVencer(b.validade));
            },
            contarPorSituacao() {
                const total = { seguro: 0, atencao: 0, breve: 0, vencido: 0 };
                dados.alimentos.listar().forEach(alimento => {
                    total[utilitarios.classificarValidade(utilitarios.diasParaVencer(alimento.validade)).chave] += 1;
                });
                return total;
            }
        },
        historico: {
            listar() {
                return lerListaSegura(chaves.historico).filter(registro => registro && (registro.tipo === 'consumido' || registro.tipo === 'descartado') && registro.data);
            },
            registrar(tipo, alimento) {
                const registro = { tipo, nome: alimento.nome, categoria: alimento.categoria, quantidade: alimento.quantidade, data: utilitarios.hojeIso(), exemplo: Boolean(alimento.exemplo) };
                return armazenamento.gravar(chaves.historico, [registro].concat(dados.historico.listar()));
            },
            salvarLista(lista) {
                return armazenamento.gravar(chaves.historico, lista);
            }
        },
        compras: {
            listar() {
                return lerListaSegura(chaves.compras).filter(item => item && item.id && typeof item.nome === 'string');
            },
            salvar(lista) {
                return armazenamento.gravar(chaves.compras, lista);
            }
        },
        receitasProprias: {
            listar() {
                return lerListaSegura(chaves.receitasProprias).filter(receita => receita && typeof receita.nome === 'string' && Array.isArray(receita.ingredientes) && Array.isArray(receita.passos));
            },
            salvar(lista) {
                return armazenamento.gravar(chaves.receitasProprias, lista);
            }
        },
        exemplos: {
            existem() {
                return dados.alimentos.listar().some(alimento => alimento.exemplo) || dados.historico.listar().some(registro => registro.exemplo);
            },
            carregar() {
                const modelos = [
                    ['Iogurte natural', '1 unidade', 'Laticínios', 'Geladeira', 0],
                    ['Frango congelado', '500 g', 'Carnes', 'Freezer', -1],
                    ['Tomate', '4 unidades', 'Frutas e verduras', 'Geladeira', 2],
                    ['Leite integral', '2 unidades', 'Laticínios', 'Geladeira', 3],
                    ['Pão de forma', '1 pacote', 'Padaria', 'Armário', 5],
                    ['Arroz', '2 kg', 'Grãos e massas', 'Armário', 120]
                ];
                const exemplos = modelos.map(([nome, quantidade, categoria, local, dias], posicao) => ({
                    id: utilitarios.gerarId() + posicao,
                    nome,
                    quantidade,
                    categoria,
                    local,
                    validade: utilitarios.somarDias(dias),
                    dataCadastro: utilitarios.hojeIso(),
                    exemplo: true
                }));
                dados.alimentos.salvarLista(dados.alimentos.listar().concat(exemplos));
                const nomesHistorico = ['Leite integral', 'Tomate', 'Pão de forma', 'Iogurte natural', 'Frango congelado', 'Arroz', 'Queijo', 'Banana'];
                const registros = Array.from({ length: 23 }, (_, posicao) => ({
                    tipo: [4, 9, 14, 19, 22].includes(posicao) ? 'descartado' : 'consumido',
                    nome: nomesHistorico[posicao % nomesHistorico.length],
                    categoria: 'Outros',
                    quantidade: '1 unidade',
                    data: utilitarios.somarDias(-(posicao + 1)),
                    exemplo: true
                }));
                dados.historico.salvarLista(dados.historico.listar().concat(registros));
            },
            remover() {
                dados.alimentos.salvarLista(dados.alimentos.listar().filter(alimento => !alimento.exemplo));
                dados.historico.salvarLista(dados.historico.listar().filter(registro => !registro.exemplo));
            }
        },
        limparTudo() {
            Object.values(chaves).forEach(chave => armazenamento.remover(chave));
        }
    };

    const criarAnel = dias => {
        const situacao = utilitarios.classificarValidade(dias);
        const circunferencia = 125.66;
        const fracao = dias < 0 ? 1 : Math.max(Math.min(dias, 14) / 14, 0.08);
        const deslocamento = (circunferencia * (1 - fracao)).toFixed(1);
        return `<span class="anel ${situacao.classe}" aria-hidden="true"><svg viewBox="0 0 48 48"><circle class="anel-trilha" cx="24" cy="24" r="20"/><circle class="anel-progresso" cx="24" cy="24" r="20" stroke-dasharray="${circunferencia}" stroke-dashoffset="${deslocamento}"/></svg><b>${situacao.anel}</b></span>`;
    };

    const criarCartaoAlimento = (alimento, opcoes = {}) => {
        const dias = utilitarios.diasParaVencer(alimento.validade);
        const situacao = utilitarios.classificarValidade(dias);
        const nome = utilitarios.escaparHtml(alimento.nome);
        const acoes = opcoes.acoes
            ? `<div class="acoes-item"><a class="botao botao-pequeno botao-contorno" href="cadastrar.html?editar=${alimento.id}">Editar</a><button type="button" class="botao botao-pequeno botao-contorno" data-acao="consumir" data-id="${alimento.id}">Consumido</button><button type="button" class="botao botao-pequeno botao-perigo" data-acao="descartar" data-id="${alimento.id}">Descartar</button></div>`
            : '';
        return `<li class="item-alimento ${situacao.classe}"><span class="espaco-imagem imagem-alimento" data-categoria="${utilitarios.escaparHtml(alimento.categoria)}" data-alternativo="Imagem de ${nome}"></span><div class="informacoes-alimento"><h3>${nome}</h3><p class="texto-suave">${utilitarios.escaparHtml(alimento.quantidade)} · ${utilitarios.escaparHtml(alimento.categoria)} · ${utilitarios.escaparHtml(alimento.local)}</p><span class="etiqueta">${situacao.texto}</span><p class="texto-suave">Validade: ${utilitarios.formatarDataBrasileira(alimento.validade)}</p>${acoes}</div>${criarAnel(dias)}</li>`;
    };

    const avisar = (mensagem, tipo) => {
        let caixa = document.querySelector('.aviso');
        if (!caixa) {
            caixa = document.createElement('div');
            caixa.className = 'aviso';
            caixa.setAttribute('role', 'status');
            document.body.appendChild(caixa);
        }
        caixa.textContent = mensagem;
        caixa.classList.toggle('aviso-erro', tipo === 'erro');
        caixa.classList.add('visivel');
        clearTimeout(caixa.temporizador);
        caixa.temporizador = setTimeout(() => caixa.classList.remove('visivel'), 2600);
    };

    const paginasMenu = [
        { id: 'inicio', rotulo: 'Início', arquivo: 'inicio.html', icone: '<path d="M3 11l9-8 9 8v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>' },
        { id: 'despensa', rotulo: 'Despensa', arquivo: 'despensa.html', icone: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>' },
        { id: 'receitas', rotulo: 'Receitas', arquivo: 'receitas.html', icone: '<path d="M4 5a1 1 0 0 1 1-1h7v16H5a1 1 0 0 1-1-1zM12 4h7a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-7"/>' },
        { id: 'alertas', rotulo: 'Alertas', arquivo: 'alertas.html', icone: '<path d="M6 17v-6a6 6 0 0 1 12 0v6l2 2H4zM10 21h4"/>' },
        { id: 'escanear', rotulo: 'Escanear', arquivo: 'escanear.html', icone: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16"/>' },
        { id: 'alexa', rotulo: 'Alexa', arquivo: 'alexa.html', icone: '<path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3"/>' },
        { id: 'compras', rotulo: 'Lista de compras', arquivo: 'compras.html', icone: '<path d="M4 5h2l2 10h9l2-7H7M9 20h.01M17 20h.01"/>' },
        { id: 'impacto', rotulo: 'Meu impacto', arquivo: 'impacto.html', icone: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>' },
        { id: 'ajuda', rotulo: 'Ajuda', arquivo: 'ajuda.html', icone: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/>' },
        { id: 'perfil', rotulo: 'Perfil', arquivo: 'perfil.html', icone: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.5 4-7 8-7s8 2.5 8 7"/>' }
    ];

    const criarIcone = caminho => `<svg viewBox="0 0 24 24" aria-hidden="true">${caminho}</svg>`;

    const criarLinkMenu = (pagina, atual) => {
        const link = document.createElement('a');
        link.href = pagina.arquivo;
        link.innerHTML = `${criarIcone(pagina.icone)}<span>${pagina.rotulo}</span>`;
        if (pagina.id === atual) {
            link.setAttribute('aria-current', 'page');
        }
        return link;
    };

    const montarNavegacao = () => {
        if (document.body.dataset.area !== 'aplicativo') {
            return;
        }
        const atual = document.body.dataset.pagina;
        const buscar = id => paginasMenu.find(pagina => pagina.id === id);
        const lateral = document.createElement('aside');
        lateral.className = 'lateral';
        const marca = document.createElement('a');
        marca.className = 'marca';
        marca.href = 'inicio.html';
        marca.innerHTML = '<span class="espaco-imagem imagem-logo" data-imagem="logo" data-alternativo="Logo do Validade Inteligente"></span><span>Validade Inteligente</span>';
        const navegacao = document.createElement('nav');
        navegacao.setAttribute('aria-label', 'Principal');
        paginasMenu.forEach(pagina => navegacao.appendChild(criarLinkMenu(pagina, atual)));
        const adicionar = document.createElement('a');
        adicionar.className = 'botao botao-primario';
        adicionar.href = 'cadastrar.html';
        adicionar.textContent = 'Adicionar alimento';
        const sair = document.createElement('button');
        sair.type = 'button';
        sair.className = 'botao botao-contorno botao-pequeno';
        sair.dataset.acaoSair = 'sim';
        sair.textContent = 'Sair da conta';
        lateral.append(marca, navegacao, adicionar, sair);
        const barra = document.createElement('nav');
        barra.className = 'barra-inferior';
        barra.setAttribute('aria-label', 'Navegação');
        const central = document.createElement('a');
        central.className = 'botao-central';
        central.href = 'cadastrar.html';
        central.setAttribute('aria-label', 'Adicionar alimento');
        central.innerHTML = criarIcone('<path d="M12 5v14M5 12h14"/>');
        barra.append(criarLinkMenu(buscar('inicio'), atual), criarLinkMenu(buscar('despensa'), atual), central, criarLinkMenu(buscar('receitas'), atual), criarLinkMenu(buscar('perfil'), atual));
        document.body.prepend(lateral);
        document.body.appendChild(barra);
    };

    const prepararImagens = () => {
        document.querySelectorAll('.espaco-imagem').forEach(espaco => {
            if (espaco.dataset.preparado) {
                return;
            }
            espaco.dataset.preparado = 'sim';
            const caminho = espaco.dataset.categoria ? caminhosImagens.categorias[espaco.dataset.categoria] : caminhosImagens[espaco.dataset.imagem];
            const alternativo = espaco.dataset.alternativo || '';
            espaco.setAttribute('role', 'img');
            espaco.setAttribute('aria-label', alternativo);
            if (!caminho) {
                return;
            }
            const carregador = new Image();
            carregador.onload = () => {
                const imagem = document.createElement('img');
                imagem.src = caminho;
                imagem.alt = alternativo;
                espaco.removeAttribute('role');
                espaco.removeAttribute('aria-label');
                espaco.appendChild(imagem);
                espaco.classList.add('com-imagem');
            };
            carregador.src = caminho;
        });
    };

    const iniciar = () => {
        montarNavegacao();
        prepararImagens();
    };

    iniciar();

    return { chaves, categorias, locais, caminhosImagens, armazenamento, utilitarios, dados, interface: { criarAnel, criarCartaoAlimento, avisar, prepararImagens } };
})();