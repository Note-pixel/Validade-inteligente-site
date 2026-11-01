'use strict';
/* Alexa em modo demonstração: interpreta comandos (voz do navegador ou texto) e atua na despensa */
const KEY = 'vi:alexa';
const el = id => document.getElementById(id);
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const NUMS = { um: 1, uma: 1, dois: 2, duas: 2, 'três': 3, tres: 3, quatro: 4, cinco: 5, seis: 6 };
const lerLink = () => { try { return JSON.parse(localStorage.getItem(KEY)) || { on: false }; } catch (e) { return { on: false }; } };
const gravarLink = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } };

function desenhaStatus() {
  const on = lerLink().on;
  el('st-titulo').textContent = on ? 'Alexa vinculada' : 'Alexa não vinculada';
  el('st-texto').textContent = on ? 'Modo demonstração: os comandos funcionam neste navegador.' : 'Vincule para cadastrar alimentos por voz.';
  const b = el('btn-link');
  b.textContent = on ? 'Desvincular' : 'Vincular com a Alexa';
  b.className = on ? 'btn ghost' : 'btn primary';
  el('area-voz').hidden = !on;
}
function fala(quem, texto) {
  const li = document.createElement('li');
  li.className = `msg ${quem}`;
  li.textContent = texto;
  el('conversa').appendChild(li);
  li.scrollIntoView({ block: 'nearest' });
}
function dataDe(t) {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  let m = t.match(/dia (\d{1,2})/);
  if (m) {
    let d = new Date(hoje.getFullYear(), hoje.getMonth(), Number(m[1]));
    if (d < hoje) d = new Date(hoje.getFullYear(), hoje.getMonth() + 1, Number(m[1]));
    return VI.addDias(Math.round((d - hoje) / 864e5));
  }
  if (/amanh[ãa]/.test(t)) return VI.addDias(1);
  m = t.match(/em (\d+) dias?/);
  return m ? VI.addDias(Number(m[1])) : VI.addDias(7);
}
function interpreta(texto) {
  const t = texto.toLowerCase().trim().replace(/[.!?]+$/, '');
  if (/o que vence/.test(t)) {
    const lim = /hoje/.test(t) ? 0 : /amanh[ãa]/.test(t) ? 1 : 7;
    const l = VI.load().filter(a => VI.dias(a.validade) <= lim).sort((a, b) => VI.dias(a.validade) - VI.dias(b.validade));
    const quando = lim === 0 ? 'hoje' : lim === 1 ? 'até amanhã' : 'nesta semana';
    return l.length ? `Vencem ${quando}: ${l.map(a => a.nome).join(', ')}.` : `Nada vence ${quando}. Tudo em dia!`;
  }
  const m = t.match(/adicion\w*\s+(?:(\d+|um|uma|dois|duas|três|tres|quatro|cinco|seis)\s+)?(.+?)(?:\s+que\s+venc\w+\s+(.+))?$/);
  if (!m) return 'Não entendi. Tente: "adicione dois ovos que vencem dia 20".';
  const q = m[1] ? (NUMS[m[1]] || Number(m[1])) : 1;
  const nome = m[2].replace(/^(o|a|os|as|de|do|da)\s+/, '').trim();
  if (nome.length < 2) return 'Qual alimento você quer adicionar?';
  const item = { id: Date.now(), nome: nome.charAt(0).toUpperCase() + nome.slice(1), qtd: `${q} ${q === 1 ? 'unidade' : 'unidades'}`, local: 'Geladeira', validade: dataDe(m[3] || '') };
  VI.save(VI.load().concat([item]));
  return `Pronto! Adicionei ${item.qtd} de ${item.nome.toLowerCase()} à despensa. Validade: ${item.validade.slice(8, 10)}/${item.validade.slice(5, 7)}.`;
}
function executa(texto) {
  if (!texto.trim()) return;
  fala('voce', texto);
  fala('alexa', interpreta(texto));
}

el('btn-link').addEventListener('click', () => {
  const on = !lerLink().on;
  gravarLink({ on });
  desenhaStatus();
  VI.toast(on ? 'Alexa vinculada (demonstração)' : 'Alexa desvinculada');
});
el('form-cmd').addEventListener('submit', e => { e.preventDefault(); executa(el('cmd').value); el('cmd').value = ''; el('cmd').focus(); });
el('exemplos').addEventListener('click', e => { const b = e.target.closest('button[data-cmd]'); if (b) executa(b.dataset.cmd); });

const mic = el('btn-mic');
if (SR) {
  const rec = new SR();
  rec.lang = 'pt-BR';
  rec.onresult = e => executa(e.results[0][0].transcript);
  rec.onerror = () => { mic.classList.remove('ouvindo'); fala('alexa', 'Não consegui ouvir. Verifique a permissão do microfone ou digite o comando.'); };
  rec.onend = () => mic.classList.remove('ouvindo');
  mic.addEventListener('click', () => { mic.classList.add('ouvindo'); try { rec.start(); } catch (e) { /* já está ouvindo */ } });
} else {
  mic.hidden = true;
  el('aviso-voz').hidden = false;
}
desenhaStatus();