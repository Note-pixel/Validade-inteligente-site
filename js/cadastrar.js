'use strict';
/* Cadastro de alimento. O envio é ligado primeiro, para salvar mesmo que algum elemento opcional da página falte. */
const form = document.getElementById('form-alimento');
const campo = id => form.elements[id];
const msgErro = id => document.getElementById(`e-${id}`);

const mostraTotal = () => {
  const alvo = document.getElementById('total');
  if (!alvo) return;
  const n = VI.load().length;
  alvo.textContent = `Você já controla ${n} ${n === 1 ? 'alimento' : 'alimentos'}.`;
};
const previa = () => {
  const alvo = document.getElementById('previa');
  if (!alvo) return;
  alvo.innerHTML = VI.item({
    nome: campo('nome').value.trim() || 'Seu alimento', qtd: campo('qtd').value.trim() || '1 unidade',
    local: campo('local').value, validade: campo('validade').value || VI.addDias(7)
  });
};
const limpaErros = () => ['nome', 'validade'].forEach(id => {
  const m = msgErro(id); if (m) m.textContent = '';
  campo(id).removeAttribute('aria-invalid');
});

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
    ids.forEach(id => { const m = msgErro(id); if (m) m.textContent = erros[id]; campo(id).setAttribute('aria-invalid', 'true'); });
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

campo('validade').value = VI.addDias(7);
mostraTotal();
previa();
form.addEventListener('input', previa);
form.addEventListener('change', previa);