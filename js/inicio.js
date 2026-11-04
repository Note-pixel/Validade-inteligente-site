'use strict';
const saudacao = document.getElementById('saudacao');
if (saudacao) saudacao.textContent = `Olá, ${banco.usuario().nome.split(' ')[0]}`;
const ordenados = banco.alimentos().slice().sort((a, b) => diasRestantes(a.validade) - diasRestantes(b.validade));
const totais = { seguro: 0, breve: 0, vencido: 0 };
ordenados.forEach(alimento => {
  const classe = situacao(diasRestantes(alimento.validade)).classe;
  if (classe === 'situacao-vencido') totais.vencido++;
  else if (classe === 'situacao-breve') totais.breve++;
  else totais.seguro++;
});
document.getElementById('total-seguros').textContent = totais.seguro;
document.getElementById('total-breve').textContent = totais.breve;
document.getElementById('total-vencidos').textContent = totais.vencido;
const destaque = document.getElementById('destaque');
const lista = document.getElementById('lista');
const proximo = ordenados.find(alimento => diasRestantes(alimento.validade) >= 0) || ordenados[0];
if (!proximo) {
  destaque.innerHTML = '<div class="cartao vazio"><img class="imagem-vazio" src="" alt="Cesta de alimentos vazia"><h3>Sua despensa está vazia</h3><p class="texto-suave">Adicione seu primeiro alimento para começar.</p><p class="afastar-topo"><a class="botao botao-primario" href="cadastrar.html">Adicionar alimento</a></p></div>';
} else {
  const dias = diasRestantes(proximo.validade);
  const estado = situacao(dias);
  destaque.innerHTML = `<article class="destaque ${estado.classe}"><div><p class="destaque-rotulo">Próximo a vencer</p><h3>${escapar(proximo.nome)}</h3><p class="texto-suave">${escapar(proximo.quantidade)} · ${escapar(proximo.local)}</p><span class="etiqueta"><i></i>${estado.texto}</span><br><a class="botao botao-primario botao-pequeno" href="despensa.html">Ver na despensa</a></div>${anel(dias)}</article>`;
  lista.innerHTML = ordenados.filter(alimento => alimento !== proximo).slice(0, 3).map(alimento => cartaoAlimento(alimento)).join('');
}