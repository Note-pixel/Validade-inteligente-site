'use strict';
const configuracoes = banco.configuracoes();
const gruposAlerta = [
  { classe: 'situacao-vencido', titulo: 'Vencidos', regra: dias => dias < 0 },
  { classe: 'situacao-breve', titulo: 'Vencem em até 3 dias', regra: dias => dias >= 0 && dias <= 3 },
  { classe: 'situacao-atencao', titulo: 'Atenção nesta semana', regra: dias => dias >= 4 }
];
const desenharAlertas = () => {
  const vazio = document.getElementById('vazio');
  if (!configuracoes.avisos) {
    document.getElementById('grupos').innerHTML = '';
    document.getElementById('resumo').textContent = '';
    document.getElementById('vazio-titulo').textContent = 'Avisos desligados';
    document.getElementById('vazio-texto').textContent = 'Ative os avisos no Perfil para ver os alertas.';
    vazio.hidden = false;
    return;
  }
  const urgentes = banco.alimentos().filter(alimento => diasRestantes(alimento.validade) <= configuracoes.antecedencia).sort((a, b) => diasRestantes(a.validade) - diasRestantes(b.validade));
  document.getElementById('resumo').textContent = urgentes.length ? `${urgentes.length} ${urgentes.length === 1 ? 'alimento precisa' : 'alimentos precisam'} da sua atenção.` : '';
  document.getElementById('grupos').innerHTML = gruposAlerta.map(grupo => {
    const itens = urgentes.filter(alimento => grupo.regra(diasRestantes(alimento.validade)));
    return itens.length ? `<h2 class="grupo ${grupo.classe}"><i></i>${grupo.titulo} <small>${itens.length}</small></h2><ul class="pilha">${itens.map(alimento => cartaoAlimento(alimento, true)).join('')}</ul>` : '';
  }).join('');
  vazio.hidden = urgentes.length > 0;
};
ligarAcoes(document.getElementById('grupos'), desenharAlertas);
desenharAlertas();