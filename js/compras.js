'use strict';
const obter = id => document.getElementById(id);
const enderecoCadastro = item => `cadastrar.html?${new URLSearchParams({ nome: item.nome, quantidade: item.quantidade === '1 unidade' ? '' : item.quantidade }).toString()}`;
const desenhar = () => {
  const compras = banco.compras();
  const pendentes = compras.filter(item => !item.comprado).length;
  obter('contagem').textContent = compras.length ? `${pendentes} ${pendentes === 1 ? 'item para comprar' : 'itens para comprar'}` : '';
  obter('lista-compras').innerHTML = compras.map(item => `<li class="cartao linha-compra${item.comprado ? ' comprado' : ''}"><label class="marcar"><input type="checkbox" data-id="${item.id}"${item.comprado ? ' checked' : ''}><span><strong>${escapar(item.nome)}</strong><br><span class="texto-suave">${escapar(item.quantidade)}</span></span></label><div class="acoes-linha">${item.comprado ? `<a class="botao botao-pequeno botao-primario" href="${escapar(enderecoCadastro(item))}">Cadastrar na despensa</a>` : ''}<button type="button" class="botao botao-pequeno botao-contorno" data-remover="${item.id}">Remover</button></div></li>`).join('');
  obter('vazio').hidden = compras.length > 0;
  const nomes = [...new Set(banco.historico().map(registro => registro.nome))];
  const sugestoes = nomes.filter(nome => !banco.alimentos().some(alimento => alimento.nome === nome) && !compras.some(item => item.nome === nome)).slice(0, 6);
  obter('area-sugestoes').hidden = sugestoes.length === 0;
  obter('sugestoes').innerHTML = sugestoes.map(nome => `<button type="button" class="filtro" data-sugestao="${escapar(nome)}">+ ${escapar(nome)}</button>`).join('');
};
const adicionar = (nome, quantidade) => {
  banco.salvarCompras(banco.compras().concat([{ id: Date.now(), nome, quantidade: quantidade || '1 unidade', comprado: false }]));
  desenhar();
};
obter('formulario-compras').addEventListener('submit', evento => {
  evento.preventDefault();
  const nome = obter('item').value.trim();
  obter('erro-item').textContent = '';
  if (nome.length < 2) { obter('erro-item').textContent = 'Digite o nome do item.'; obter('item').setAttribute('aria-invalid', 'true'); obter('item').focus(); return; }
  obter('item').removeAttribute('aria-invalid');
  adicionar(nome, obter('quantidade').value.trim());
  avisar(`${nome} adicionado à lista`);
  evento.target.reset();
  obter('item').focus();
});
obter('lista-compras').addEventListener('change', evento => {
  const caixa = evento.target.closest('input[data-id]');
  if (!caixa) return;
  banco.salvarCompras(banco.compras().map(item => (item.id === Number(caixa.dataset.id) ? Object.assign({}, item, { comprado: caixa.checked }) : item)));
  desenhar();
});
obter('lista-compras').addEventListener('click', evento => {
  const botao = evento.target.closest('[data-remover]');
  if (!botao) return;
  banco.salvarCompras(banco.compras().filter(item => item.id !== Number(botao.dataset.remover)));
  desenhar();
});
obter('sugestoes').addEventListener('click', evento => {
  const botao = evento.target.closest('[data-sugestao]');
  if (botao) adicionar(botao.dataset.sugestao, '');
});
desenhar();