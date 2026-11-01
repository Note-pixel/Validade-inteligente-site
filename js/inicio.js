'use strict';
const quem = VI.usuario();
const sd = document.getElementById('saudacao');
if (sd) sd.textContent = `Olá, ${quem && quem.nome ? quem.nome.split(' ')[0] : 'Milena'}`;
const itens = VI.load().slice().sort((a, b) => VI.dias(a.validade) - VI.dias(b.validade));
const total = { ok: 0, so: 0, ex: 0 };
itens.forEach(a => { const k = VI.status(VI.dias(a.validade)).k; total[k === 'wn' ? 'ok' : k]++; });
Object.keys(total).forEach(k => { document.getElementById(`n-${k}`).textContent = total[k]; });

const hero = document.getElementById('hero');
const lista = document.getElementById('lista');
const proximo = itens.find(a => VI.dias(a.validade) >= 0) || itens[0];

if (!proximo) {
  hero.innerHTML = '<div class="card vazio"><h3>Sua despensa está vazia</h3><p class="muted">Adicione seu primeiro alimento para começar.</p><p style="margin-top:16px"><a class="btn primary" href="cadastrar.html">Adicionar alimento</a></p></div>';
} else {
  const d = VI.dias(proximo.validade), s = VI.status(d);
  hero.innerHTML = `<article class="hero s-${s.k}"><div><p class="eyebrow">Próximo a vencer</p><h3>${VI.esc(proximo.nome)}</h3><p class="muted">${VI.esc(proximo.qtd)} · ${VI.esc(proximo.local)}</p><span class="chip"><i></i>${s.t}</span><br><a class="btn primary sm" href="despensa.html">Ver na despensa</a></div>${VI.ring(d)}</article>`;
  lista.innerHTML = itens.filter(a => a !== proximo).slice(0, 3).map(a => VI.item(a)).join('');
}