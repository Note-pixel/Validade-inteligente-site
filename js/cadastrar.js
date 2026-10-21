'use strict';
const form = document.getElementById('form-alimento');
const campo = id => form.elements[id];
const mostraTotal = () => {
  const n = VI.load().length;
  document.getElementById('total').textContent = `Você já controla ${n} ${n === 1 ? 'alimento' : 'alimentos'}.`;
};
const limpaErros = () => {
  ['nome', 'validade'].forEach(id => { document.getElementById(`e-${id}`).textContent = ''; campo(id).removeAttribute('aria-invalid'); });
};

const previa = () => {
  document.getElementById('previa').innerHTML = VI.item({ nome: campo('nome').value.trim() || 'Seu alimento', qtd: campo('qtd').value.trim() || '1 unidade', local: campo('local').value, validade: campo('validade').value || VI.addDias(7) });
};

campo('validade').value = VI.addDias(7);
mostraTotal();
previa();
form.addEventListener('input', previa);
form.addEventListener('change', previa);

form.addEventListener('submit', e => {
  e.preventDefault();
  limpaErros();
  const nome = campo('nome').value.trim();
  const validade = campo('validade').value;
  const erros = {};
  if (nome.length < 2) erros.nome = 'Digite o nome do alimento.';
  if (!validade) erros.validade = 'Informe a data de validade.';
  const ids = Object.keys(erros);
  if (ids.length) {
    ids.forEach(id => { document.getElementById(`e-${id}`).textContent = erros[id]; campo(id).setAttribute('aria-invalid', 'true'); });
    campo(ids[0]).focus();
    return;
  }
  const lista = VI.load().slice();
  lista.push({ id: Date.now(), nome, qtd: campo('qtd').value.trim() || '1 unidade', local: campo('local').value, validade });
  VI.save(lista);
  VI.toast(`${nome} salvo na despensa`);
  form.reset();
  campo('validade').value = VI.addDias(7);
  mostraTotal();
  previa();
  campo('nome').focus();
});