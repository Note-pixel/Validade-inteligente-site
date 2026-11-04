'use strict';
const nomesFiltros = ['Todos', 'Vencidos', 'Vencendo', 'Geladeira', 'Armário', 'Freezer'];
const grupos = [
  { classe: 'situacao-vencido', titulo: 'Vencidos', regra: dias => dias < 0 },
  { classe: 'situacao-breve', titulo: 'Vence logo', regra: dias => dias >= 0 && dias <= 3 },
  { classe: 'situacao-atencao', titulo: 'Atenção', regra: dias => dias >= 4 && dias <= 7 },
  { classe: 'situacao-seguro', titulo: 'Seguros', regra: dias => dias > 7 }
];
let filtroAtual = 'Todos';
const campoBusca = document.getElementById('busca');
const aplicarFiltro = (alimento, termo) => {
  const dias = diasRestantes(alimento.validade);
  if (termo && !alimento.nome.toLowerCase().includes(termo)) return false;
  if (filtroAtual === 'Vencidos') return dias < 0;
  if (filtroAtual === 'Vencendo') return dias >= 0 && dias <= 3;
  if (filtroAtual !== 'Todos') return alimento.local === filtroAtual;
  return true;
};
const desenhar = () => {
  const termo = campoBusca.value.trim().toLowerCase();
  const visiveis = banco.alimentos().filter(alimento => aplicarFiltro(alimento, termo)).sort((a, b) => diasRestantes(a.validade) - diasRestantes(b.validade));
  document.getElementById('contagem').textContent = `${visiveis.length} ${visiveis.length === 1 ? 'alimento' : 'alimentos'} · ordenados por validade`;
  document.getElementById('grupos').innerHTML = grupos.map(grupo => {
    const itens = visiveis.filter(alimento => grupo.regra(diasRestantes(alimento.validade)));
    return itens.length ? `<h2 class="grupo ${grupo.classe}"><i></i>${grupo.titulo} <small>${itens.length}</small></h2><ul class="pilha">${itens.map(alimento => cartaoAlimento(alimento, true)).join('')}</ul>` : '';
  }).join('');
  document.getElementById('vazio').hidden = visiveis.length > 0;
};
const caixaFiltros = document.getElementById('filtros');
caixaFiltros.innerHTML = nomesFiltros.map(nome => `<button type="button" class="filtro" aria-pressed="${nome === filtroAtual}">${nome}</button>`).join('');
caixaFiltros.addEventListener('click', evento => {
  const botao = evento.target.closest('.filtro');
  if (!botao) return;
  filtroAtual = botao.textContent;
  document.querySelectorAll('.filtro').forEach(outro => outro.setAttribute('aria-pressed', String(outro === botao)));
  desenhar();
});
document.getElementById('formulario-busca').addEventListener('submit', evento => { evento.preventDefault(); desenhar(); });
campoBusca.addEventListener('input', desenhar);
document.getElementById('grupos').addEventListener('click', evento => {
  const botao = evento.target.closest('button[data-acao]');
  if (!botao) return;
  const id = Number(botao.dataset.id);
  const alimento = banco.alimentos().find(item => item.id === id);
  if (!alimento) return;
  banco.registrar(botao.dataset.acao === 'consumir' ? 'consumido' : 'descartado', alimento.nome);
  banco.salvarAlimentos(banco.alimentos().filter(item => item.id !== id));
  avisar(botao.dataset.acao === 'consumir' ? `${alimento.nome} marcado como consumido` : `${alimento.nome} descartado`);
  desenhar();
});
desenhar();