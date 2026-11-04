'use strict';
const obter = id => document.getElementById(id);
const Reconhecimento = window.SpeechRecognition || window.webkitSpeechRecognition;
const numeros = { um: 1, uma: 1, dois: 2, duas: 2, 'três': 3, tres: 3, quatro: 4, cinco: 5, seis: 6 };
const desenharEstado = () => {
  const ativa = banco.alexaVinculada();
  obter('estado-titulo').textContent = ativa ? 'Alexa vinculada' : 'Alexa não vinculada';
  obter('estado-texto').textContent = ativa ? 'Modo demonstração: os comandos funcionam neste navegador.' : 'Vincule para cadastrar alimentos por voz.';
  const botao = obter('botao-vincular');
  botao.textContent = ativa ? 'Desvincular' : 'Vincular com a Alexa';
  botao.className = ativa ? 'botao botao-contorno' : 'botao botao-primario';
  obter('area-voz').hidden = !ativa;
};
const falar = (quem, texto) => {
  const linha = document.createElement('li');
  linha.className = `fala fala-${quem}`;
  linha.textContent = texto;
  obter('conversa').appendChild(linha);
  if (linha.scrollIntoView) linha.scrollIntoView({ block: 'nearest' });
};
const dataDoComando = texto => {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  let achado = texto.match(/dia (\d{1,2})/);
  if (achado) {
    let data = new Date(hoje.getFullYear(), hoje.getMonth(), Number(achado[1]));
    if (data < hoje) data = new Date(hoje.getFullYear(), hoje.getMonth() + 1, Number(achado[1]));
    return somarDias(Math.round((data - hoje) / 864e5));
  }
  if (/amanh[ãa]/.test(texto)) return somarDias(1);
  achado = texto.match(/em (\d+) dias?/);
  return achado ? somarDias(Number(achado[1])) : somarDias(7);
};
const interpretar = original => {
  const texto = original.toLowerCase().trim().replace(/[.!?]+$/, '');
  if (/o que vence/.test(texto)) {
    const limite = /hoje/.test(texto) ? 0 : /amanh[ãa]/.test(texto) ? 1 : 7;
    const lista = banco.alimentos().filter(alimento => diasRestantes(alimento.validade) <= limite).sort((a, b) => diasRestantes(a.validade) - diasRestantes(b.validade));
    const quando = limite === 0 ? 'hoje' : limite === 1 ? 'até amanhã' : 'nesta semana';
    return lista.length ? `Vencem ${quando}: ${lista.map(alimento => alimento.nome).join(', ')}.` : `Nada vence ${quando}. Tudo em dia!`;
  }
  const achado = texto.match(/adicion\w*\s+(?:(\d+|um|uma|dois|duas|três|tres|quatro|cinco|seis)\s+)?(.+?)(?:\s+que\s+venc\w+\s+(.+))?$/);
  if (!achado) return 'Não entendi. Tente: "adicione dois ovos que vencem dia 20".';
  const quantidade = achado[1] ? (numeros[achado[1]] || Number(achado[1])) : 1;
  const nome = achado[2].replace(/^(o|a|os|as|de|do|da)\s+/, '').trim();
  if (nome.length < 2) return 'Qual alimento você quer adicionar?';
  const novo = { id: Date.now(), nome: nome.charAt(0).toUpperCase() + nome.slice(1), quantidade: `${quantidade} ${quantidade === 1 ? 'unidade' : 'unidades'}`, local: 'Geladeira', validade: dataDoComando(achado[3] || '') };
  banco.salvarAlimentos(banco.alimentos().concat([novo]));
  return `Pronto! Adicionei ${novo.quantidade} de ${novo.nome.toLowerCase()} à despensa. Validade: ${novo.validade.slice(8, 10)}/${novo.validade.slice(5, 7)}.`;
};
const executar = texto => {
  if (!texto.trim()) return;
  falar('voce', texto);
  falar('alexa', interpretar(texto));
};
obter('botao-vincular').addEventListener('click', () => {
  const ativa = !banco.alexaVinculada();
  banco.salvarAlexa(ativa);
  desenharEstado();
  avisar(ativa ? 'Alexa vinculada (demonstração)' : 'Alexa desvinculada');
});
obter('formulario-comando').addEventListener('submit', evento => { evento.preventDefault(); executar(obter('comando').value); obter('comando').value = ''; obter('comando').focus(); });
obter('exemplos').addEventListener('click', evento => { const botao = evento.target.closest('button[data-comando]'); if (botao) executar(botao.dataset.comando); });
const microfone = obter('botao-microfone');
if (Reconhecimento) {
  const reconhecimento = new Reconhecimento();
  reconhecimento.lang = 'pt-BR';
  reconhecimento.onresult = evento => executar(evento.results[0][0].transcript);
  reconhecimento.onerror = () => { microfone.classList.remove('ouvindo'); falar('alexa', 'Não consegui ouvir. Verifique a permissão do microfone ou digite o comando.'); };
  reconhecimento.onend = () => microfone.classList.remove('ouvindo');
  microfone.addEventListener('click', () => { microfone.classList.add('ouvindo'); try { reconhecimento.start(); } catch (erro) { microfone.classList.remove('ouvindo'); } });
} else {
  microfone.hidden = true;
  obter('aviso-voz').hidden = false;
}
desenharEstado();