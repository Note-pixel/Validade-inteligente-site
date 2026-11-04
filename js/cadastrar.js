'use strict';
const formulario = document.getElementById('formulario-alimento');
const campo = id => formulario.elements[id];
const mensagemErro = id => document.getElementById(`erro-${id}`);
const mostrarTotal = () => {
  const alvo = document.getElementById('total');
  if (!alvo) return;
  const quantidade = banco.alimentos().length;
  alvo.textContent = `Você já controla ${quantidade} ${quantidade === 1 ? 'alimento' : 'alimentos'}.`;
};
const mostrarPrevia = () => {
  const alvo = document.getElementById('previa');
  if (!alvo) return;
  alvo.innerHTML = cartaoAlimento({
    nome: campo('nome').value.trim() || 'Seu alimento', quantidade: campo('quantidade').value.trim() || '1 unidade',
    local: campo('local').value, validade: campo('validade').value || somarDias(7)
  });
};
const limparErros = () => ['nome', 'validade'].forEach(id => {
  const mensagem = mensagemErro(id);
  if (mensagem) mensagem.textContent = '';
  campo(id).removeAttribute('aria-invalid');
});
formulario.addEventListener('submit', evento => {
  evento.preventDefault();
  limparErros();
  const nome = campo('nome').value.trim();
  const validade = campo('validade').value;
  const erros = {};
  if (nome.length < 2) erros.nome = 'Digite o nome do alimento.';
  if (!validade) erros.validade = 'Informe a data de validade.';
  const campos = Object.keys(erros);
  if (campos.length) {
    campos.forEach(id => {
      const mensagem = mensagemErro(id);
      if (mensagem) mensagem.textContent = erros[id];
      campo(id).setAttribute('aria-invalid', 'true');
    });
    campo(campos[0]).focus();
    return;
  }
  if (alimentoEditado) {
    banco.salvarAlimentos(banco.alimentos().map(alimento => (alimento.id === idEdicao ? Object.assign({}, alimento, { nome, quantidade: campo('quantidade').value.trim() || '1 unidade', local: campo('local').value, validade }) : alimento)));
    avisar(`${nome} atualizado`);
    setTimeout(() => window.location.assign('despensa.html'), 700);
    return;
  }
  const novo = { id: Date.now(), nome, quantidade: campo('quantidade').value.trim() || '1 unidade', local: campo('local').value, validade };
  banco.salvarAlimentos(banco.alimentos().concat([novo]));
  avisar(`${nome} salvo na despensa`);
  formulario.reset();
  campo('validade').value = somarDias(7);
  mostrarTotal();
  mostrarPrevia();
  campo('nome').focus();
});
campo('validade').value = somarDias(7);
const parametros = new URLSearchParams(window.location.search);
if (parametros.get('nome')) campo('nome').value = parametros.get('nome');
if (parametros.get('quantidade')) campo('quantidade').value = parametros.get('quantidade');
if (/^\d{4}-\d{2}-\d{2}$/.test(parametros.get('validade') || '')) campo('validade').value = parametros.get('validade');
const avisoOrigem = document.getElementById('origem');
if (avisoOrigem && parametros.get('origem')) {
  avisoOrigem.hidden = false;
  avisoOrigem.textContent = parametros.get('origem') === 'qr' ? 'Dados lidos do QR Code. Confira a validade na embalagem.' : 'Produto lido pelo código de barras. Confira a validade na embalagem.';
}
const idEdicao = Number(parametros.get('editar')) || 0;
const alimentoEditado = idEdicao ? banco.alimentos().find(alimento => alimento.id === idEdicao) : null;
if (alimentoEditado) {
  campo('nome').value = alimentoEditado.nome;
  campo('quantidade').value = alimentoEditado.quantidade;
  campo('local').value = alimentoEditado.local;
  campo('validade').value = alimentoEditado.validade;
  document.getElementById('titulo-pagina').textContent = 'Editar alimento';
  document.getElementById('botao-salvar').textContent = 'Salvar alterações';
}
mostrarTotal();
mostrarPrevia();
formulario.addEventListener('input', mostrarPrevia);
formulario.addEventListener('change', mostrarPrevia);