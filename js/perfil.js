'use strict';
const el = id => document.getElementById(id);
const u = VI.usuario() || { nome: 'Milena de Quadros', email: 'milena@email.com' };
const cfg = VI.config();
el('p-nome').value = u.nome;
el('p-email').value = u.email || '';
el('c-ant').value = String(cfg.antecedencia);
el('c-hora').value = cfg.horario;
el('c-avisos').checked = cfg.avisos;
let sessao = false;
try { sessao = Boolean(sessionStorage.getItem('vi:sessao')); } catch (e) { /* sem sessão */ }
el('sessao').textContent = sessao ? 'Sessão ativa neste navegador.' : 'Você ainda não entrou nesta sessão.';

el('form-perfil').addEventListener('submit', e => {
  e.preventDefault();
  const nome = el('p-nome').value.trim();
  if (nome.length < 2) { el('e-p-nome').textContent = 'Digite seu nome.'; el('p-nome').setAttribute('aria-invalid', 'true'); el('p-nome').focus(); return; }
  el('e-p-nome').textContent = '';
  el('p-nome').removeAttribute('aria-invalid');
  VI.salvarUsuario(Object.assign({}, u, { nome }));
  VI.toast('Perfil atualizado');
});
el('form-config').addEventListener('submit', e => {
  e.preventDefault();
  VI.salvarConfig({ antecedencia: Number(el('c-ant').value), horario: el('c-hora').value || '18:00', avisos: el('c-avisos').checked });
  VI.toast('Alertas atualizados');
});
el('btn-notif').addEventListener('click', async () => {
  if (!('Notification' in window)) { VI.toast('Seu navegador não oferece notificações'); return; }
  try {
    const p = await Notification.requestPermission();
    if (p !== 'granted') { VI.toast('Permissão não concedida'); return; }
    new Notification('Validade Inteligente', { body: 'Avisos ativados! Vamos lembrar o que vence.' });
    VI.toast('Avisos do navegador ativados');
  } catch (err) { VI.toast('Não foi possível ativar os avisos neste aparelho'); }
});
el('btn-sair').addEventListener('click', () => {
  try { sessionStorage.removeItem('vi:sessao'); } catch (e) { /* sem sessão */ }
  window.location.assign('login.html');
});
el('btn-apagar').addEventListener('click', () => {
  if (!window.confirm('Apagar todos os dados guardados neste navegador?')) return;
  VI.limpar();
  VI.toast('Dados apagados');
  setTimeout(() => window.location.assign('index.html'), 800);
});