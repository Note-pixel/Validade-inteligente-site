'use strict';
const FILTROS = ['Todos', 'Vencidos', 'Vencendo', 'Geladeira', 'Armário', 'Freezer'];
const GRUPOS = [
  ['ex', 'Vencidos', d => d < 0], ['so', 'Vence logo', d => d >= 0 && d <= 3],
  ['wn', 'Atenção', d => d >= 4 && d <= 7], ['ok', 'Seguros', d => d > 7]
];
let filtro = 'Todos';
const campoBusca = document.getElementById('busca');

function passa(a, termo) {
  const d = VI.dias(a.validade);
  if (termo && !a.nome.toLowerCase().includes(termo)) return false;
  if (filtro === 'Vencidos') return d < 0;
  if (filtro === 'Vencendo') return d >= 0 && d <= 3;
  if (filtro !== 'Todos') return a.local === filtro;
  return true;
}

function render() {
  const termo = campoBusca.value.trim().toLowerCase();
  const visiveis = VI.load().filter(a => passa(a, termo)).sort((a, b) => VI.dias(a.validade) - VI.dias(b.validade));
  document.getElementById('contagem').textContent = `${visiveis.length} ${visiveis.length === 1 ? 'alimento' : 'alimentos'} · ordenados por validade`;
  document.getElementById('grupos').innerHTML = GRUPOS.map(([k, titulo, regra]) => {
    const g = visiveis.filter(a => regra(VI.dias(a.validade)));
    return g.length ? `<h2 class="grupo s-${k}"><i></i>${titulo} <small>${g.length}</small></h2><ul class="stack">${g.map(a => VI.item(a, true)).join('')}</ul>` : '';
  }).join('');
  document.getElementById('vazio').hidden = visiveis.length > 0;
}

document.getElementById('filtros').innerHTML = FILTROS.map(f => `<button type="button" class="fchip" aria-pressed="${f === filtro}">${f}</button>`).join('');
document.getElementById('filtros').addEventListener('click', e => {
  const b = e.target.closest('.fchip');
  if (!b) return;
  filtro = b.textContent;
  document.querySelectorAll('.fchip').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  render();
});
document.getElementById('form-busca').addEventListener('submit', e => { e.preventDefault(); render(); });
campoBusca.addEventListener('input', render);
document.getElementById('grupos').addEventListener('click', e => {
  const b = e.target.closest('button[data-acao]');
  if (!b) return;
  const id = Number(b.dataset.id);
  const item = VI.load().find(a => a.id === id);
  VI.save(VI.load().filter(a => a.id !== id));
  VI.toast(b.dataset.acao === 'consumir' ? `${item.nome} marcado como consumido` : `${item.nome} descartado`);
  render();
});
render();