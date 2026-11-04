'use strict';
const chaves = { alimentos: 'vi:alimentos', historico: 'vi:historico', usuario: 'vi:usuario', receitas: 'vi:receitas', configuracoes: 'vi:configuracoes', alexa: 'vi:alexa', compras: 'vi:compras', minhasReceitas: 'vi:minhas-receitas' };
const memoria = {};
const gravarBanco = (chave, valor) => {
  memoria[chave] = valor;
  try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (erro) { return; }
};
const lerBanco = (chave, padrao, valida) => {
  if (chave in memoria) return memoria[chave];
  try {
    const bruto = localStorage.getItem(chave);
    if (bruto !== null) {
      const valor = JSON.parse(bruto);
      if (valida(valor)) { memoria[chave] = valor; return valor; }
    }
  } catch (erro) { memoria[chave] = null; }
  gravarBanco(chave, padrao());
  return memoria[chave];
};
const formatarData = data => `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
const somarDias = quantidade => { const data = new Date(); data.setDate(data.getDate() + quantidade); return formatarData(data); };
const diasRestantes = iso => {
  const [ano, mes, dia] = iso.split('-').map(Number);
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  return Math.round((new Date(ano, mes - 1, dia) - hoje) / 864e5);
};
const alimentosIniciais = () => [
  ['Iogurte natural', '1 unidade', 'Geladeira', 0], ['Frango congelado', '500 g', 'Freezer', -1],
  ['Tomate', '4 unidades', 'Geladeira', 2], ['Leite integral', '2 unidades', 'Geladeira', 3],
  ['Pão de forma', '1 pacote', 'Armário', 5], ['Arroz', '2 kg', 'Armário', 120]
].map(([nome, quantidade, local, dias], posicao) => ({ id: posicao + 1, nome, quantidade, local, validade: somarDias(dias) }));
const banco = {
  alimentos: () => lerBanco(chaves.alimentos, alimentosIniciais, Array.isArray),
  salvarAlimentos: lista => gravarBanco(chaves.alimentos, lista),
  historico: () => lerBanco(chaves.historico, () => [], Array.isArray),
  receitasProprias: () => lerBanco(chaves.minhasReceitas, () => [], Array.isArray),
  salvarReceitasProprias: lista => gravarBanco(chaves.minhasReceitas, lista),
  salvarHistorico: lista => gravarBanco(chaves.historico, lista),
  compras: () => lerBanco(chaves.compras, () => [], Array.isArray),
  salvarCompras: lista => gravarBanco(chaves.compras, lista),
  registrar: (tipo, nome) => gravarBanco(chaves.historico, [{ tipo, nome, data: somarDias(0) }].concat(banco.historico())),
  usuario: () => lerBanco(chaves.usuario, () => ({ nome: 'Milena de Quadros', email: 'milena@email.com' }), valor => valor && typeof valor === 'object'),
  salvarUsuario: usuario => gravarBanco(chaves.usuario, usuario),
  configuracoes: () => Object.assign({ antecedencia: 3, horario: '18:00', avisos: true, chaveIA: '', modeloIA: 'gemini-2.5-flash' }, lerBanco(chaves.configuracoes, () => ({}), valor => valor && typeof valor === 'object')),
  salvarConfiguracoes: configuracoes => gravarBanco(chaves.configuracoes, configuracoes),
  receitasUsadas: () => lerBanco(chaves.receitas, () => [], Array.isArray),
  registrarReceita: receita => gravarBanco(chaves.receitas, [receita].concat(banco.receitasUsadas())),
  alexaVinculada: () => lerBanco(chaves.alexa, () => ({ ativa: false }), valor => valor && typeof valor === 'object').ativa,
  salvarAlexa: ativa => gravarBanco(chaves.alexa, { ativa }),
  apagarTudo: () => {
    Object.keys(memoria).forEach(chave => delete memoria[chave]);
    Object.values(chaves).forEach(chave => { try { localStorage.removeItem(chave); } catch (erro) { return; } });
  }
};
const escapar = texto => String(texto).replace(/[&<>"']/g, caractere => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[caractere]));
const situacao = dias => {
  if (dias < 0) return { classe: 'situacao-vencido', texto: dias === -1 ? 'Vencido há 1 dia' : `Vencido há ${-dias} dias`, anel: '!' };
  if (dias === 0) return { classe: 'situacao-breve', texto: 'Vence hoje', anel: 'Hoje' };
  if (dias <= 3) return { classe: 'situacao-breve', texto: `Vence em ${dias} ${dias === 1 ? 'dia' : 'dias'}`, anel: `${dias}d` };
  if (dias <= 7) return { classe: 'situacao-atencao', texto: `Atenção · ${dias} dias`, anel: `${dias}d` };
  return { classe: 'situacao-seguro', texto: `Seguro · ${dias} dias`, anel: `${dias}d` };
};
const anel = dias => {
  const estado = situacao(dias);
  const circunferencia = 125.66;
  const fracao = dias < 0 ? 1 : Math.max(Math.min(dias, 14) / 14, 0.08);
  return `<span class="anel ${estado.classe}" aria-hidden="true"><svg viewBox="0 0 48 48"><circle class="trilha" cx="24" cy="24" r="20"/><circle class="progresso" cx="24" cy="24" r="20" stroke-dasharray="${circunferencia}" stroke-dashoffset="${(circunferencia * (1 - fracao)).toFixed(1)}"/></svg><b>${estado.anel}</b></span>`;
};
const cartaoAlimento = (alimento, comAcoes = false) => {
  const dias = diasRestantes(alimento.validade);
  const estado = situacao(dias);
  const botoes = comAcoes
    ? `<div class="acoes"><a class="botao botao-pequeno botao-contorno" href="cadastrar.html?editar=${alimento.id}">Editar</a><button type="button" class="botao botao-pequeno botao-contorno" data-id="${alimento.id}" data-acao="consumir">Consumido</button><button type="button" class="botao botao-pequeno botao-perigo" data-id="${alimento.id}" data-acao="descartar">Descartar</button></div>`
    : '';
  return `<li class="item-alimento ${estado.classe}"><span class="azulejo">${escapar(alimento.nome.charAt(0).toUpperCase())}<img src="" alt="Imagem de ${escapar(alimento.nome)}"></span><div class="informacoes"><h3>${escapar(alimento.nome)}</h3><p class="texto-suave">${escapar(alimento.quantidade)} · ${escapar(alimento.local)}</p><span class="etiqueta"><i></i>${estado.texto}</span>${botoes}</div>${anel(dias)}</li>`;
};
const avisar = mensagem => {
  let caixa = document.querySelector('.aviso');
  if (!caixa) {
    caixa = document.createElement('div');
    caixa.className = 'aviso';
    caixa.setAttribute('role', 'status');
    document.body.appendChild(caixa);
  }
  caixa.textContent = mensagem;
  caixa.classList.add('visivel');
  clearTimeout(caixa.temporizador);
  caixa.temporizador = setTimeout(() => caixa.classList.remove('visivel'), 2400);
};
const ligarAcoes = (recipiente, aoAtualizar) => recipiente.addEventListener('click', evento => {
  const botao = evento.target.closest('button[data-acao]');
  if (!botao) return;
  const id = Number(botao.dataset.id);
  const alimento = banco.alimentos().find(item => item.id === id);
  if (!alimento) return;
  banco.registrar(botao.dataset.acao === 'consumir' ? 'consumido' : 'descartado', alimento.nome);
  banco.salvarAlimentos(banco.alimentos().filter(item => item.id !== id));
  avisar(botao.dataset.acao === 'consumir' ? `${alimento.nome} marcado como consumido` : `${alimento.nome} descartado`);
  aoAtualizar();
});
const paginas = [
  { id: 'inicio', rotulo: 'Início', arquivo: 'index.html', icone: '<path d="M3 11l9-8 9 8v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>' },
  { id: 'despensa', rotulo: 'Despensa', arquivo: 'despensa.html', icone: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>' },
  { id: 'receitas', rotulo: 'Receitas', arquivo: 'receitas.html', icone: '<path d="M4 5a1 1 0 0 1 1-1h7v16H5a1 1 0 0 1-1-1zM12 4h7a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-7"/>' },
  { id: 'alertas', rotulo: 'Alertas', arquivo: 'alertas.html', icone: '<path d="M6 17v-6a6 6 0 0 1 12 0v6l2 2H4zM10 21h4"/>' },
  { id: 'escanear', rotulo: 'Ler código', arquivo: 'escanear.html', icone: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16"/>' },
  { id: 'alexa', rotulo: 'Alexa', arquivo: 'alexa.html', icone: '<path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3"/>' },
  { id: 'impacto', rotulo: 'Meu impacto', arquivo: 'impacto.html', icone: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>' },
  { id: 'compras', rotulo: 'Lista de compras', arquivo: 'compras.html', icone: '<path d="M4 5h2l2 10h9l2-7H7M9 20h.01M17 20h.01"/>' },
  { id: 'ajuda', rotulo: 'Ajuda', arquivo: 'ajuda.html', icone: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/>' },
  { id: 'perfil', rotulo: 'Perfil', arquivo: 'perfil.html', icone: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.5 4-7 8-7s8 2.5 8 7"/>' }
];
const criarIcone = caminho => `<svg viewBox="0 0 24 24" aria-hidden="true">${caminho}</svg>`;
const criarLink = (pagina, atual) => {
  const link = document.createElement('a');
  link.href = pagina.arquivo;
  link.innerHTML = `${criarIcone(pagina.icone)}<span>${pagina.rotulo}</span>`;
  if (pagina.id === atual) link.setAttribute('aria-current', 'page');
  return link;
};
const montarMenu = () => {
  const atual = document.body.dataset.pagina;
  const lateral = document.createElement('aside');
  lateral.className = 'lateral';
  const marca = document.createElement('a');
  marca.className = 'marca';
  marca.href = 'index.html';
  marca.innerHTML = '<img class="logo" src="" alt="Logo do Validade Inteligente"><span>Validade Inteligente</span>';
  const navegacao = document.createElement('nav');
  navegacao.setAttribute('aria-label', 'Principal');
  paginas.forEach(pagina => navegacao.appendChild(criarLink(pagina, atual)));
  const adicionar = document.createElement('a');
  adicionar.className = 'botao botao-primario';
  adicionar.href = 'cadastrar.html';
  adicionar.textContent = 'Adicionar alimento';
  lateral.append(marca, navegacao, adicionar);
  const barra = document.createElement('nav');
  barra.className = 'barra-inferior';
  barra.setAttribute('aria-label', 'Navegação');
  const central = document.createElement('a');
  central.className = 'botao-central';
  central.href = 'cadastrar.html';
  central.setAttribute('aria-label', 'Adicionar alimento');
  central.innerHTML = criarIcone('<path d="M12 5v14M5 12h14"/>');
  const buscar = id => paginas.find(pagina => pagina.id === id);
  barra.append(criarLink(buscar('inicio'), atual), criarLink(buscar('despensa'), atual), central, criarLink(buscar('receitas'), atual), criarLink(buscar('perfil'), atual));
  document.body.prepend(lateral);
  document.body.appendChild(barra);
};
const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sairDaPagina = destino => {
  if (reduzirMovimento) { destino(); return; }
  document.documentElement.classList.add('saindo');
  setTimeout(destino, 180);
};
document.addEventListener('click', evento => {
  const voltar = evento.target.closest('[data-voltar]');
  if (voltar) {
    evento.preventDefault();
    const mesmoSite = document.referrer && new URL(document.referrer).origin === window.location.origin;
    sairDaPagina(() => (mesmoSite && window.history.length > 1 ? window.history.back() : window.location.assign(voltar.dataset.alternativa || 'index.html')));
    return;
  }
  const link = evento.target.closest('a[href]');
  if (!link || evento.defaultPrevented || evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || link.target) return;
  const endereco = new URL(link.href, window.location.href);
  if (endereco.origin !== window.location.origin) return;
  if (endereco.pathname === window.location.pathname && endereco.hash) return;
  evento.preventDefault();
  sairDaPagina(() => window.location.assign(endereco.href));
});
window.addEventListener('pageshow', evento => { if (evento.persisted) document.documentElement.classList.remove('saindo'); });
const resumirSenha = texto => { let resumo = 5381; for (const caractere of texto) resumo = ((resumo << 5) + resumo + caractere.charCodeAt(0)) | 0; return String(resumo); };
if (document.body.dataset.pagina !== 'entrada') montarMenu();