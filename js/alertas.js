'use strict';
const GRUPOS = [['ex', 'Vencidos', d => d < 0], ['so', 'Vencem em até 3 dias', d => d >= 0 && d <= 3], ['wn', 'Atenção nesta semana', d => d >= 4 && d <= 7]];
const mensagem = (a, d) => {
  if (d < 0) return `${a.nome} venceu ${d === -1 ? 'ontem' : `há ${-d} dias`}`;
  if (d === 0) return `${a.nome} vence hoje`;
  if (d === 1) return `${a.nome} vence amanhã`;
  return `${a.nome} vence em ${d} dias`;
};
function card(a) {
  const d = VI.dias(a.validade), s = VI.status(d);
  return `<li class="item s-${s.k}"><div class="tile" aria-hidden="true">${VI.esc(a.nome.charAt(0).toUpperCase())}</div><div class="info"><h3>${VI.esc(mensagem(a, d))}</h3><p class="muted">${VI.esc(a.qtd)} · ${VI.esc(a.local)}</p><div class="acts"><button type="button" class="btn sm ghost" data-id="${a.id}" data-acao="consumir">Consumido</button><button type="button" class="btn sm danger" data-id="${a.id}" data-acao="descartar">Descartar</button></div></div>${VI.ring(d)}</li>`;
}
function render() {
  const urgentes = VI.load().filter(a => VI.dias(a.validade) <= VI.config().antecedencia).sort((a, b) => VI.dias(a.validade) - VI.dias(b.validade));
  document.getElementById('resumo').textContent = urgentes.length ? `${urgentes.length} ${urgentes.length === 1 ? 'alimento precisa' : 'alimentos precisam'} da sua atenção.` : '';
  document.getElementById('grupos').innerHTML = GRUPOS.map(([k, titulo, regra]) => {
    const g = urgentes.filter(a => regra(VI.dias(a.validade)));
    return g.length ? `<h2 class="grupo s-${k}"><i></i>${titulo} <small>${g.length}</small></h2><ul class="stack">${g.map(card).join('')}</ul>` : '';
  }).join('');
  document.getElementById('vazio').hidden = urgentes.length > 0;
}
document.getElementById('grupos').addEventListener('click', e => {
  const b = e.target.closest('button[data-acao]');
  if (!b) return;
  const id = Number(b.dataset.id), a = VI.load().find(x => x.id === id);
  if (!a) return;
  VI.registrar(b.dataset.acao === 'consumir' ? 'c' : 'd', a.nome);
  VI.save(VI.load().filter(x => x.id !== id));
  VI.toast(b.dataset.acao === 'consumir' ? `${a.nome} marcado como consumido` : `${a.nome} descartado`);
  render();
});
render();