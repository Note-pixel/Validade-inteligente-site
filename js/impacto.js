'use strict';
const obter = id => document.getElementById(id);
const nomesExemplo = ['Leite integral', 'Tomate', 'Pão de forma', 'Iogurte natural', 'Frango congelado', 'Arroz', 'Queijo', 'Banana'];
const desenhar = () => {
  const historico = banco.historico();
  const consumidos = historico.filter(registro => registro.tipo === 'consumido').length;
  const descartados = historico.length - consumidos;
  const percentual = historico.length ? Math.round((consumidos / historico.length) * 100) : 0;
  obter('aproveitados').textContent = `${consumidos} de ${historico.length}`;
  obter('mensagem').textContent = historico.length ? `Você aproveita ${percentual}% do que cadastra.` : 'Marque alimentos como consumidos ou descartados para ver seu impacto.';
  obter('preenchimento').style.width = `${percentual}%`;
  obter('total-consumidos').textContent = consumidos;
  obter('total-descartados').textContent = descartados;
  obter('botao-exemplo').hidden = historico.length > 0;
  const semanas = [0, 0, 0, 0];
  historico.filter(registro => registro.tipo === 'descartado').forEach(registro => { semanas[Math.min(3, Math.floor(-diasRestantes(registro.data) / 7))]++; });
  const ordem = semanas.slice().reverse();
  const maior = Math.max(1, ...ordem);
  obter('grafico').innerHTML = ordem.map((quantidade, posicao) => `<div class="coluna-grafico"><span>${quantidade}</span><i style="height:${Math.max(8, (quantidade / maior) * 100)}%"></i><small>S${posicao + 1}</small></div>`).join('');
  obter('recentes').innerHTML = historico.length
    ? historico.slice(0, 6).map(registro => {
      const [, mes, dia] = registro.data.split('-');
      return `<li class="item-alimento item-historico ${registro.tipo === 'consumido' ? 'situacao-seguro' : 'situacao-vencido'}"><div class="informacoes"><h3>${escapar(registro.nome)}</h3><span class="etiqueta"><i></i>${registro.tipo === 'consumido' ? 'Consumido' : 'Descartado'}</span></div><span class="texto-suave">${dia}/${mes}</span></li>`;
    }).join('')
    : '<li class="cartao uso"><p class="texto-suave">Nada por aqui ainda.</p></li>';
};
obter('botao-exemplo').addEventListener('click', () => {
  banco.salvarHistorico(Array.from({ length: 23 }, (_, posicao) => ({ tipo: [4, 9, 14, 19, 22].includes(posicao) ? 'descartado' : 'consumido', nome: nomesExemplo[posicao % 8], data: somarDias(-(posicao + 1)) })));
  avisar('Histórico de exemplo carregado');
  desenhar();
});
desenhar();