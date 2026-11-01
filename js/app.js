'use strict';
/* Núcleo compartilhado: dados no localStorage, status de validade, componentes e navegação */
const VI = (() => {
  const KEY = 'vi:alimentos';
  const fmt = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const addDias = n => { const d = new Date(); d.setDate(d.getDate() + n); return fmt(d); };
  const dias = iso => {
    const [y, m, d] = iso.split('-').map(Number);
    const h = new Date(); h.setHours(0, 0, 0, 0);
    return Math.round((new Date(y, m - 1, d) - h) / 864e5);
  };
  const SEED = [
    ['Iogurte natural', '1 unidade', 'Geladeira', 0], ['Frango congelado', '500 g', 'Freezer', -1],
    ['Tomate', '4 unidades', 'Geladeira', 2], ['Leite integral', '2 unidades', 'Geladeira', 3],
    ['Pão de forma', '1 pacote', 'Armário', 5], ['Arroz', '2 kg', 'Armário', 120]
  ].map(([nome, qtd, local, n], i) => ({ id: i + 1, nome, qtd, local, validade: addDias(n) }));

  let mem = null;
  const save = lista => { mem = lista; try { localStorage.setItem(KEY, JSON.stringify(lista)); } catch (e) { /* armazenamento indisponível: mantém em memória */ } };
  const load = () => {
    if (mem) return mem;
    try {
      const bruto = localStorage.getItem(KEY);
      if (bruto) { const l = JSON.parse(bruto); if (Array.isArray(l)) { mem = l; return mem; } }
    } catch (e) { /* dados inválidos: recomeça com os exemplos */ }
    save(SEED.slice()); return mem;
  };

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const status = d => {
    if (d < 0) return { k: 'ex', t: d === -1 ? 'Vencido há 1 dia' : `Vencido há ${-d} dias`, r: '!' };
    if (d === 0) return { k: 'so', t: 'Vence hoje', r: 'Hoje' };
    if (d <= 3) return { k: 'so', t: `Vence em ${d} ${d === 1 ? 'dia' : 'dias'}`, r: `${d}d` };
    if (d <= 7) return { k: 'wn', t: `Atenção · ${d} dias`, r: `${d}d` };
    return { k: 'ok', t: `Seguro · ${d} dias`, r: `${d}d` };
  };
  const ring = d => {
    const s = status(d), c = 125.66, f = d < 0 ? 1 : Math.max(Math.min(d, 14) / 14, 0.08);
    return `<span class="ring s-${s.k}" aria-hidden="true"><svg viewBox="0 0 48 48"><circle class="tr" cx="24" cy="24" r="20"/><circle class="pg" cx="24" cy="24" r="20" stroke-dasharray="${c}" stroke-dashoffset="${(c * (1 - f)).toFixed(1)}"/></svg><b>${s.r}</b></span>`;
  };
  const item = (a, acoes = false) => {
    const d = dias(a.validade), s = status(d);
    const botoes = acoes ? `<div class="acts"><button type="button" class="btn sm ghost" data-id="${a.id}" data-acao="consumir">Consumido</button><button type="button" class="btn sm danger" data-id="${a.id}" data-acao="descartar">Descartar</button></div>` : '';
    return `<li class="item s-${s.k}"><div class="tile" aria-hidden="true">${esc(a.nome.charAt(0).toUpperCase())}</div><div class="info"><h3>${esc(a.nome)}</h3><p class="muted">${esc(a.qtd)} · ${esc(a.local)}</p><span class="chip"><i></i>${s.t}</span>${botoes}</div>${ring(d)}</li>`;
  };

  const toast = msg => {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2400);
  };
  const usuario = () => { try { return JSON.parse(localStorage.getItem('vi:usuario')); } catch (e) { return null; } };
  const HK = 'vi:historico';
  const NOMES = ['Leite integral', 'Tomate', 'Pão de forma', 'Iogurte natural', 'Frango congelado', 'Arroz', 'Queijo', 'Banana'];
  const historico = () => {
    try { const h = JSON.parse(localStorage.getItem(HK)); if (Array.isArray(h)) return h; } catch (e) { /* recomeça com exemplo */ }
    const h = Array.from({ length: 23 }, (_, i) => ({ tipo: [4, 9, 14, 19, 22].includes(i) ? 'd' : 'c', nome: NOMES[i % 8], data: addDias(-(i + 1)) }));
    try { localStorage.setItem(HK, JSON.stringify(h)); } catch (e) { /* sem armazenamento */ }
    return h;
  };
  const registrar = (tipo, nome) => {
    const h = historico().slice(); h.unshift({ tipo, nome, data: addDias(0) });
    try { localStorage.setItem(HK, JSON.stringify(h)); } catch (e) { /* sem armazenamento */ }
  };
  const CK = 'vi:config';
  const config = () => {
    const base = { antecedencia: 3, horario: '18:00', avisos: true };
    try { const c = JSON.parse(localStorage.getItem(CK)); if (c && typeof c === 'object') return Object.assign(base, c); } catch (e) { /* usa o padrão */ }
    return base;
  };
  const salvarConfig = c => { try { localStorage.setItem(CK, JSON.stringify(c)); } catch (e) { /* sem armazenamento */ } };
  const salvarUsuario = u => { try { localStorage.setItem('vi:usuario', JSON.stringify(u)); } catch (e) { /* sem armazenamento */ } };
  const limpar = () => { mem = null; ['vi:alimentos', 'vi:historico', 'vi:usuario', 'vi:config', 'vi:alexa'].forEach(k => { try { localStorage.removeItem(k); } catch (e) { /* ignora */ } }); };
  return { config, salvarConfig, salvarUsuario, limpar, historico, registrar, usuario, load, save, dias, status, ring, item, esc, toast, addDias };
})();