'use strict';
const obter = id => document.getElementById(id);
const mostrarErro = (id, texto) => {
  obter(`erro-${id}`).textContent = texto;
  if (texto) obter(id).setAttribute('aria-invalid', 'true'); else obter(id).removeAttribute('aria-invalid');
};
obter('formulario-entrar').addEventListener('submit', evento => {
  evento.preventDefault();
  const email = obter('email').value.trim().toLowerCase();
  const senha = obter('senha').value;
  mostrarErro('email', '');
  mostrarErro('senha', '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { mostrarErro('email', 'Digite um e-mail válido.'); obter('email').focus(); return; }
  if (!senha) { mostrarErro('senha', 'Digite sua senha.'); obter('senha').focus(); return; }
  const usuario = banco.usuario();
  if (!usuario.senha) { mostrarErro('senha', 'Nenhuma conta criada neste navegador. Crie sua conta.'); return; }
  if (usuario.email !== email || usuario.senha !== resumirSenha(senha)) { mostrarErro('senha', 'Confira seu e-mail e sua senha.'); obter('senha').focus(); return; }
  try { sessionStorage.setItem('vi:sessao', '1'); } catch (erro) { window.location.assign('index.html'); return; }
  window.location.assign('index.html');
});