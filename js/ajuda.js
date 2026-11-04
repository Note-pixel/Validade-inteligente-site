'use strict';
const perguntas = [...document.querySelectorAll('#perguntas details')];
const normalizar = texto => texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const filtrar = () => {
  const termo = normalizar(document.getElementById('busca-ajuda').value.trim());
  let visiveis = 0;
  perguntas.forEach(pergunta => {
    const mostrar = !termo || normalizar(pergunta.textContent).includes(termo);
    pergunta.hidden = !mostrar;
    if (mostrar) visiveis++;
  });
  document.getElementById('vazio').hidden = visiveis > 0;
};
document.getElementById('formulario-ajuda').addEventListener('submit', evento => { evento.preventDefault(); filtrar(); });
document.getElementById('busca-ajuda').addEventListener('input', filtrar);