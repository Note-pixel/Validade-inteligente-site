'use strict';
const h = VI.historico();
const c = h.filter(x => x.tipo === 'c').length;
const d = h.length - c;
const pct = h.length ? Math.round((c / h.length) * 100) : 0;
const txt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

txt('sub', 'Só alimentos, sem valores em dinheiro');
txt('aprov', `${c} de ${h.length}`);
txt('n-c', c);
txt('n-d', d);
txt('msg', h.length ? `Você aproveita ${pct}% do que cadastra.` : 'Cadastre e consuma alimentos para ver seu impacto.');
document.getElementById('fill').style.width = `${pct}%`;

const semanas = [0, 0, 0, 0];
h.filter(x => x.tipo === 'd').forEach(x => { semanas[Math.min(3, Math.floor(-VI.dias(x.data) / 7))]++; });
const ordem = semanas.slice().reverse();
const maior = Math.max(1, ...ordem);
document.getElementById('bars').innerHTML = ordem.map((n, i) =>
  `<div class="col"><span class="num-b">${n}</span><i style="height:${Math.max(8, (n / maior) * 100)}%"></i><small>S${i + 1}</small></div>`).join('');

document.getElementById('hist').innerHTML = h.slice(0, 6).map(x => {
  const [, m, dia] = x.data.split('-');
  return `<li class="item ${x.tipo === 'c' ? 's-ok' : 's-ex'}" style="grid-template-columns:minmax(0,1fr) auto"><div class="info"><h3>${VI.esc(x.nome)}</h3><span class="chip"><i></i>${x.tipo === 'c' ? 'Consumido' : 'Descartado'}</span></div><span class="muted">${dia}/${m}</span></li>`;
}).join('');