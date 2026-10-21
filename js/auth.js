'use strict';
/* Login e cadastro (simulação no navegador: os dados ficam só neste aparelho) */
const el = id => document.getElementById(id);
const form = document.querySelector('form');
const cadastro = Boolean(el('nome'));
const hash = s => { let h = 5381; for (const c of s) h = ((h << 5) + h + c.charCodeAt(0)) | 0; return String(h); };
const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const ler = () => { try { return JSON.parse(localStorage.getItem('vi:usuario')); } catch (e) { return null; } };
const gravar = u => { try { localStorage.setItem('vi:usuario', JSON.stringify(u)); } catch (e) { /* sem armazenamento: segue sem salvar */ } };
const erro = (id, msg) => { el(`e-${id}`).textContent = msg || ''; if (msg) el(id).setAttribute('aria-invalid', 'true'); else el(id).removeAttribute('aria-invalid'); };
const forca = s => (s.length >= 8 ? 1 : 0) + (/[a-zA-Z]/.test(s) && /\d/.test(s) ? 1 : 0) + (s.length >= 12 || /[^\w\s]/.test(s) ? 1 : 0);

if (cadastro) el('senha').addEventListener('input', e => { el('forca').dataset.n = String(e.target.value ? forca(e.target.value) : 0); });

form.addEventListener('submit', e => {
  e.preventDefault();
  const campos = cadastro ? ['nome', 'email', 'senha', 'confirma', 'termos'] : ['email', 'senha'];
  campos.forEach(id => erro(id, ''));
  const v = id => el(id).value.trim();
  const falhas = {};
  if (cadastro && v('nome').length < 2) falhas.nome = 'Digite seu nome.';
  if (!emailOk(v('email'))) falhas.email = 'Digite um e-mail válido.';
  if (cadastro) {
    if (el('senha').value.length < 8) falhas.senha = 'Use pelo menos 8 caracteres.';
    if (el('confirma').value !== el('senha').value) falhas.confirma = 'As senhas não são iguais.';
    if (!el('termos').checked) falhas.termos = 'Aceite os termos para continuar.';
  } else if (!el('senha').value) falhas.senha = 'Digite sua senha.';
  const ids = Object.keys(falhas);
  if (ids.length) { ids.forEach(id => erro(id, falhas[id])); el(ids[0]).focus(); return; }
  if (cadastro) {
    gravar({ nome: v('nome'), email: v('email').toLowerCase(), senha: hash(el('senha').value) });
  } else {
    const u = ler();
    if (!u) { erro('senha', 'Conta não encontrada. Crie uma conta.'); el('email').focus(); return; }
    if (u.email !== v('email').toLowerCase() || u.senha !== hash(el('senha').value)) { erro('senha', 'Confira seu e-mail e sua senha.'); el('senha').focus(); return; }
  }
  window.location.assign('inicio.html');
});