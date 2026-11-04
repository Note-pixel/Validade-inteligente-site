'use strict';
const catalogo = [
  { nome: 'Arroz com frango e tomate', tempo: 40, nivel: 'Fácil', ingredientes: ['Arroz', 'Frango', 'Tomate', 'Cebola'], passos: ['Refogue a cebola e o frango em pedaços.', 'Junte o tomate picado e o arroz.', 'Cubra com água quente e cozinhe até secar.'] },
  { nome: 'Frango grelhado com tomate', tempo: 25, nivel: 'Fácil', ingredientes: ['Frango', 'Tomate', 'Azeite'], passos: ['Tempere o frango e grelhe dos dois lados.', 'Salteie o tomate no azeite.', 'Sirva o frango com o tomate por cima.'] },
  { nome: 'Molho de iogurte com ervas', tempo: 10, nivel: 'Fácil', ingredientes: ['Iogurte natural', 'Limão', 'Sal'], passos: ['Misture o iogurte com um fio de limão e sal.', 'Acrescente ervas picadas.', 'Gele por 10 minutos antes de servir.'] },
  { nome: 'Torrada com tomate', tempo: 10, nivel: 'Fácil', ingredientes: ['Pão de forma', 'Tomate', 'Azeite'], passos: ['Toste as fatias de pão.', 'Pique o tomate e tempere com sal e azeite.', 'Monte as torradas e sirva.'] },
  { nome: 'Arroz cremoso de leite', tempo: 30, nivel: 'Fácil', ingredientes: ['Arroz', 'Leite integral', 'Sal'], passos: ['Cozinhe o arroz em água até quase secar.', 'Junte o leite e mexa em fogo baixo.', 'Desligue quando ficar cremoso.'] }
];
const obter = id => document.getElementById(id);
const normalizar = texto => texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const combina = (a, b) => { const x = normalizar(a), y = normalizar(b); return x.includes(y) || y.includes(x); };
let selecionados = [];
let geradas = [];

const desenharIngredientes = () => {
  const itens = banco.alimentos().slice().sort((a, b) => diasRestantes(a.validade) - diasRestantes(b.validade));
  obter('subtitulo').textContent = itens.length ? `${itens.length} ingredientes na despensa` : 'Sua despensa está vazia';
  obter('ingredientes').innerHTML = itens.length
    ? itens.map(alimento => `<label class="escolha"><input type="checkbox" value="${escapar(alimento.nome)}"${diasRestantes(alimento.validade) <= 3 ? ' checked' : ''}><span>${escapar(alimento.nome)}</span></label>`).join('')
    : '<p class="texto-suave">Adicione alimentos na despensa para gerar receitas.</p>';
};
const todasReceitas = () => catalogo.concat(banco.receitasProprias());
const receitasPorRegras = ingredientes => todasReceitas()
  .map(receita => ({ nome: receita.nome, tempo: receita.tempo, nivel: receita.nivel, passos: receita.passos, origem: receita.origem || 'regras', ingredientes: receita.ingredientes.map(rotulo => ({ rotulo, tem: ingredientes.some(nome => combina(nome, rotulo)) })) }))
  .map(receita => ({ receita, tem: receita.ingredientes.filter(item => item.tem).length }))
  .filter(item => item.tem > 0)
  .sort((a, b) => b.tem / b.receita.ingredientes.length - a.tem / a.receita.ingredientes.length || b.tem - a.tem || (b.receita.origem === 'propria') - (a.receita.origem === 'propria'))
  .slice(0, 3).map(item => item.receita);
const gerarComIA = async ingredientes => {
  const configuracoes = banco.configuracoes();
  if (!configuracoes.chaveIA) throw new Error('sem-chave');
  const pergunta = `Crie 3 receitas simples em português do Brasil usando principalmente estes ingredientes: ${ingredientes.join(', ')}. Responda somente JSON no formato {"receitas":[{"nome":"","tempo":30,"nivel":"Fácil","ingredientes":[{"rotulo":"","tem":true}],"passos":[""]}]}. Use "tem": true só para ingredientes da lista e false para os demais.`;
  const resposta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(configuracoes.modeloIA)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': configuracoes.chaveIA },
    body: JSON.stringify({ contents: [{ parts: [{ text: pergunta }] }], generationConfig: { responseMimeType: 'application/json' } })
  });
  if (!resposta.ok) throw new Error(`http-${resposta.status}`);
  const dados = await resposta.json();
  return JSON.parse(dados.candidates[0].content.parts[0].text).receitas.slice(0, 3).map(receita => ({
    nome: String(receita.nome), tempo: Number(receita.tempo) || 30, nivel: String(receita.nivel || 'Fácil'), origem: 'ia',
    ingredientes: (receita.ingredientes || []).map(item => ({ rotulo: String(item.rotulo), tem: Boolean(item.tem) })), passos: (receita.passos || []).map(String)
  }));
};
const cartaoReceita = (receita, posicao) => {
  const usa = receita.ingredientes.filter(item => item.tem).length;
  return `<article class="cartao receita"><div class="topo-receita"><h3>${escapar(receita.nome)}</h3><span class="etiqueta situacao-seguro"><i></i>${receita.origem === 'ia' ? 'Criada pela IA · ' : receita.origem === 'propria' ? 'Sua receita · ' : ''}usa ${usa} de ${receita.ingredientes.length}</span></div>
    <p class="texto-suave">${receita.tempo} min · ${escapar(receita.nivel)}</p>
    <ul class="ingredientes-receita">${receita.ingredientes.map(item => `<li class="etiqueta ${item.tem ? 'situacao-seguro' : 'etiqueta-falta'}">${item.tem ? '<i></i>' : ''}${escapar(item.rotulo)}${item.tem ? '' : ' · falta'}</li>`).join('')}</ul>
    <details><summary>Modo de preparo</summary><ol>${receita.passos.map(passo => `<li>${escapar(passo)}</li>`).join('')}</ol></details>
    <button type="button" class="botao botao-pequeno botao-primario" data-posicao="${posicao}">Cozinhei! Dar baixa nos ingredientes</button></article>`;
};
const desenharResultado = mensagem => {
  obter('resultado').innerHTML = (mensagem ? `<p class="aviso-ia">${escapar(mensagem)}</p>` : '') + (geradas.length
    ? `<h2>${geradas.length} ${geradas.length === 1 ? 'receita' : 'receitas'} para você</h2>${geradas.map(cartaoReceita).join('')}`
    : '<div class="cartao vazio"><img class="imagem-vazio" src="" alt="Panela vazia"><h3>Nenhuma receita encontrada</h3><p class="texto-suave">Tente marcar mais ingredientes.</p></div>');
};
const desenharHistorico = () => {
  const usadas = banco.receitasUsadas();
  obter('historico-receitas').innerHTML = usadas.length
    ? usadas.slice(0, 8).map(receita => `<li class="cartao uso"><div class="uso-topo"><strong>${escapar(receita.nome)}</strong><span class="texto-suave">${receita.data.split('-').reverse().slice(0, 2).join('/')}</span></div><p class="texto-suave">${receita.origem === 'ia' ? 'Criada pela IA · ' : ''}${escapar(receita.ingredientes.join(', ') || 'Sem baixa na despensa')}</p></li>`).join('')
    : '<li class="cartao uso"><p class="texto-suave">Você ainda não cozinhou nenhuma receita por aqui.</p></li>';
};
const desenharUso = () => {
  const contagem = {};
  banco.historico().filter(registro => registro.tipo === 'consumido').forEach(registro => { contagem[registro.nome] = (contagem[registro.nome] || 0) + 1; });
  const lista = Object.entries(contagem).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maior = lista.length ? lista[0][1] : 1;
  obter('uso-ingredientes').innerHTML = lista.length
    ? lista.map(([nome, vezes]) => `<li class="cartao uso"><div class="uso-topo"><strong>${escapar(nome)}</strong><span class="texto-suave">${vezes} ${vezes === 1 ? 'vez' : 'vezes'}</span></div><div class="barra-uso"><span style="width:${Math.round((vezes / maior) * 100)}%"></span></div></li>`).join('')
    : '<li class="cartao uso"><p class="texto-suave">Marque alimentos como consumidos para ver o uso de cada ingrediente.</p></li>';
};
const gerar = async usarIA => {
  selecionados = [...obter('ingredientes').querySelectorAll('input:checked')].map(caixa => caixa.value);
  obter('erro-ingredientes').textContent = '';
  if (!selecionados.length) { obter('erro-ingredientes').textContent = 'Escolha pelo menos um ingrediente.'; return; }
  obter('resultado').innerHTML = '<p class="texto-suave">Criando receitas para você…</p>';
  let mensagem = '';
  geradas = [];
  if (usarIA) {
    try { geradas = await gerarComIA(selecionados); } catch (erro) { mensagem = erro.message === 'sem-chave' ? 'Para usar a IA, cadastre sua chave do Gemini no Perfil. Mostramos receitas locais por enquanto.' : 'A IA não respondeu agora. Mostramos receitas locais.'; }
  }
  if (!geradas.length) geradas = receitasPorRegras(selecionados);
  desenharResultado(mensagem);
};
const cozinhar = posicao => {
  const receita = geradas[posicao];
  if (!receita) return;
  const usados = banco.alimentos().filter(alimento => receita.ingredientes.some(item => item.tem && combina(alimento.nome, item.rotulo)));
  usados.forEach(alimento => banco.registrar('consumido', alimento.nome));
  banco.salvarAlimentos(banco.alimentos().filter(alimento => !usados.includes(alimento)));
  banco.registrarReceita({ nome: receita.nome, data: somarDias(0), origem: receita.origem, ingredientes: usados.map(alimento => alimento.nome) });
  avisar(usados.length ? 'Ingredientes atualizados na despensa' : 'Bom apetite!');
  geradas = [];
  obter('resultado').innerHTML = '';
  desenharIngredientes();
  desenharHistorico();
  desenharUso();
};
obter('formulario-receitas').addEventListener('submit', evento => { evento.preventDefault(); gerar(false); });
obter('botao-ia').addEventListener('click', () => gerar(true));
obter('resultado').addEventListener('click', evento => {
  const botao = evento.target.closest('[data-posicao]');
  if (botao) cozinhar(Number(botao.dataset.posicao));
});
desenharIngredientes();
desenharHistorico();
desenharUso();
const desenharMinhasReceitas = () => {
  const proprias = banco.receitasProprias();
  obter('minhas-receitas').innerHTML = proprias.map((receita, posicao) => `<li class="cartao uso"><div class="uso-topo"><strong>${escapar(receita.nome)}</strong><button type="button" class="botao botao-pequeno botao-contorno" data-remover-receita="${posicao}">Remover</button></div><p class="texto-suave">${receita.tempo} min · ${escapar(receita.ingredientes.join(', '))}</p></li>`).join('');
};
obter('formulario-minha-receita').addEventListener('submit', evento => {
  evento.preventDefault();
  const nome = obter('nome-receita').value.trim();
  const ingredientes = obter('ingredientes-receita').value.split(',').map(texto => texto.trim()).filter(Boolean);
  const passos = obter('passos-receita').value.split('\n').map(texto => texto.trim()).filter(Boolean);
  const erro = obter('erro-receita');
  erro.textContent = '';
  if (nome.length < 2) { erro.textContent = 'Digite o nome da receita.'; obter('nome-receita').focus(); return; }
  if (!ingredientes.length) { erro.textContent = 'Informe pelo menos um ingrediente.'; obter('ingredientes-receita').focus(); return; }
  if (!passos.length) { erro.textContent = 'Escreva pelo menos um passo do preparo.'; obter('passos-receita').focus(); return; }
  banco.salvarReceitasProprias(banco.receitasProprias().concat([{ nome, tempo: Number(obter('tempo-receita').value) || 30, nivel: 'Minha receita', ingredientes, passos, origem: 'propria' }]));
  avisar(`${nome} salva nas suas receitas`);
  evento.target.reset();
  desenharMinhasReceitas();
});
obter('minhas-receitas').addEventListener('click', evento => {
  const botao = evento.target.closest('[data-remover-receita]');
  if (!botao) return;
  banco.salvarReceitasProprias(banco.receitasProprias().filter((receita, posicao) => posicao !== Number(botao.dataset.removerReceita)));
  desenharMinhasReceitas();
});
desenharMinhasReceitas();