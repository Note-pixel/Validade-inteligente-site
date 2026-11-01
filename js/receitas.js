'use strict';
/* Receitas simuladas por regras: combina os ingredientes escolhidos com um catálogo local */
const RECEITAS = [
  { nome: 'Arroz com frango e tomate', tempo: 40, nivel: 'Fácil', ing: [['arroz', 'Arroz'], ['frango', 'Frango'], ['tomate', 'Tomate'], ['cebola', 'Cebola']],
    passos: ['Refogue a cebola e o frango em pedaços.', 'Junte o tomate picado e o arroz.', 'Cubra com água quente e cozinhe até secar.'] },
  { nome: 'Frango grelhado com tomate', tempo: 25, nivel: 'Fácil', ing: [['frango', 'Frango'], ['tomate', 'Tomate'], ['azeite', 'Azeite']],
    passos: ['Tempere o frango e grelhe dos dois lados.', 'Salteie o tomate no azeite.', 'Sirva o frango com o tomate por cima.'] },
  { nome: 'Molho de iogurte com ervas', tempo: 10, nivel: 'Fácil', ing: [['iogurte', 'Iogurte natural'], ['limao', 'Limão'], ['sal', 'Sal']],
    passos: ['Misture o iogurte com um fio de limão e sal.', 'Acrescente ervas picadas.', 'Gele por 10 minutos antes de servir.'] },
  { nome: 'Torrada com tomate', tempo: 10, nivel: 'Fácil', ing: [['pao', 'Pão de forma'], ['tomate', 'Tomate'], ['azeite', 'Azeite']],
    passos: ['Toste as fatias de pão.', 'Pique o tomate e tempere com sal e azeite.', 'Monte as torradas e sirva.'] },
  { nome: 'Arroz cremoso de leite', tempo: 30, nivel: 'Fácil', ing: [['arroz', 'Arroz'], ['leite', 'Leite integral'], ['sal', 'Sal']],
    passos: ['Cozinhe o arroz em água até quase secar.', 'Junte o leite e mexa em fogo baixo.', 'Desligue quando ficar cremoso.'] }
];
const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const picks = document.getElementById('picks');
const resultado = document.getElementById('resultado');
const erro = document.getElementById('e-picks');
let ultimoSel = [];

const itens = VI.load().slice().sort((a, b) => VI.dias(a.validade) - VI.dias(b.validade));
const sub = document.getElementById('sub');
if (sub) sub.textContent = itens.length ? `${itens.length} ingredientes na despensa` : 'Sua despensa está vazia';
picks.innerHTML = itens.length
  ? itens.map(a => `<label class="pick"><input type="checkbox" value="${VI.esc(a.nome)}"${VI.dias(a.validade) <= 3 ? ' checked' : ''}><span>${VI.esc(a.nome)}</span></label>`).join('')
  : '<p class="muted">Adicione alimentos na despensa para gerar receitas.</p>';

function montaCard(r, i) {
  const sel = ultimoSel.map(norm);
  const lista = r.ing.map(([k, rot]) => ({ rot, tem: sel.some(n => n.includes(k)) }));
  const tem = lista.filter(x => x.tem).length;
  return `<article class="card receita"><div class="rtop"><h3>${r.nome}</h3><span class="chip s-ok"><i></i>Usa ${tem} de ${lista.length} ingredientes</span></div>
    <p class="muted">${r.tempo} min · ${r.nivel}</p>
    <ul class="ings">${lista.map(x => `<li class="chip ${x.tem ? 's-ok' : 'falta'}">${x.tem ? '<i></i>' : ''}${x.rot}${x.tem ? '' : ' · falta'}</li>`).join('')}</ul>
    <details><summary>Modo de preparo</summary><ol>${r.passos.map(p => `<li>${p}</li>`).join('')}</ol></details>
    <button type="button" class="btn sm primary" data-cozinhei="${i}">Cozinhei! Dar baixa nos ingredientes</button></article>`;
}

document.getElementById('form-receitas').addEventListener('submit', e => {
  e.preventDefault();
  ultimoSel = [...picks.querySelectorAll('input:checked')].map(i => i.value);
  erro.textContent = '';
  if (!ultimoSel.length) { erro.textContent = 'Escolha pelo menos um ingrediente.'; return; }
  resultado.innerHTML = '<p class="muted">Criando receitas para você…</p>';
  setTimeout(() => {
    const sel = ultimoSel.map(norm);
    const achadas = RECEITAS.map((r, i) => ({ r, i, tem: r.ing.filter(([k]) => sel.some(n => n.includes(k))).length }))
      .filter(x => x.tem > 0).sort((a, b) => b.tem / b.r.ing.length - a.tem / a.r.ing.length || b.tem - a.tem).slice(0, 3);
    resultado.innerHTML = achadas.length
      ? `<h2>${achadas.length} ${achadas.length === 1 ? 'receita' : 'receitas'} para você</h2>${achadas.map(x => montaCard(x.r, x.i)).join('')}<p class="muted">Receitas sugeridas por regras. Confira os ingredientes antes de cozinhar.</p>`
      : '<div class="card vazio"><h3>Nenhuma receita encontrada</h3><p class="muted">Tente marcar mais ingredientes.</p></div>';
  }, 700);
});

resultado.addEventListener('click', e => {
  const b = e.target.closest('[data-cozinhei]');
  if (!b) return;
  const chaves = RECEITAS[Number(b.dataset.cozinhei)].ing.map(([k]) => k);
  const usados = VI.load().filter(a => ultimoSel.includes(a.nome) && chaves.some(k => norm(a.nome).includes(k)));
  usados.forEach(a => VI.registrar('c', a.nome));
  VI.save(VI.load().filter(a => !usados.includes(a)));
  VI.toast(usados.length ? 'Ingredientes atualizados na despensa' : 'Bom apetite!');
  resultado.innerHTML = '';
  setTimeout(() => window.location.reload(), 900);
});