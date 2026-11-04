'use strict';
const obter = id => document.getElementById(id);
const campos = ['nome', 'email', 'senha', 'confirmacao', 'termos'];
const mostrarErro = (id, texto) => {
  obter(`erro-${id}`).textContent = texto;
  if (texto) obter(id).setAttribute('aria-invalid', 'true'); else obter(id).removeAttribute('aria-invalid');
};
const nivelDaSenha = senha => (senha.length >= 8 ? 1 : 0) + (/[a-zA-Z]/.test(senha) && /\d/.test(senha) ? 1 : 0) + (senha.length >= 12 || /[^\w\s]/.test(senha) ? 1 : 0);
obter('senha').addEventListener('input', evento => { obter('forca').dataset.nivel = String(evento.target.value ? nivelDaSenha(evento.target.value) : 0); });
obter('formulario-conta').addEventListener('submit', evento => {
  evento.preventDefault();
  campos.forEach(id => mostrarErro(id, ''));
  const nome = obter('nome').value.trim();
  const email = obter('email').value.trim().toLowerCase();
  const senha = obter('senha').value;
  const falhas = {};
  if (nome.length < 2) falhas.nome = 'Digite seu nome.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) falhas.email = 'Digite um e-mail válido.';
  if (senha.length < 8) falhas.senha = 'Use pelo menos 8 caracteres.';
  if (obter('confirmacao').value !== senha) falhas.confirmacao = 'As senhas não são iguais.';
  if (!obter('termos').checked) falhas.termos = 'Aceite os termos para continuar.';
  const lista = Object.keys(falhas);
  if (lista.length) { lista.forEach(id => mostrarErro(id, falhas[id])); obter(lista[0]).focus(); return; }
  banco.salvarUsuario({ nome, email, senha: resumirSenha(senha) });
  try { sessionStorage.setItem('vi:sessao', '1'); } catch (erro) { window.location.assign('index.html'); return; }
  window.location.assign('index.html');
});