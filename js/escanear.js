'use strict';
const obter = id => document.getElementById(id);
let leitor = null;
const mensagem = (texto, erro) => { const alvo = obter('mensagem-leitor'); alvo.textContent = texto; alvo.style.color = erro ? 'var(--vencido-texto)' : ''; };
const montarEndereco = parametros => {
  const consulta = new URLSearchParams();
  Object.entries(parametros).forEach(([chave, valor]) => { if (valor) consulta.set(chave, valor); });
  return `cadastrar.html?${consulta.toString()}`;
};
const mostrarResultado = (titulo, texto, parametros) => {
  obter('resultado-titulo').textContent = titulo;
  obter('resultado-texto').textContent = texto;
  obter('link-resultado').href = montarEndereco(parametros);
  obter('resultado-codigo').hidden = false;
};
const buscarProduto = async codigo => {
  try {
    const resposta = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(codigo)}.json?fields=product_name,quantity`);
    if (!resposta.ok) return null;
    const dados = await resposta.json();
    return dados.status === 1 && dados.product && dados.product.product_name ? { nome: dados.product.product_name, quantidade: dados.product.quantity || '' } : null;
  } catch (erro) { return null; }
};
const tratarLeitura = async (texto, ehQr) => {
  const conteudo = String(texto).trim();
  obter('erro-codigo').textContent = '';
  if (!conteudo) { obter('erro-codigo').textContent = 'Digite o código ou o texto lido.'; return; }
  if (ehQr || !/^\d{6,14}$/.test(conteudo)) {
    if (/^https?:\/\//i.test(conteudo)) { mostrarResultado('QR Code lido', 'Esse QR leva a um link. Digite o nome do alimento no próximo passo.', { origem: 'qr' }); return; }
    const [nome, validade] = conteudo.split(/[;|]/).map(parte => parte.trim());
    mostrarResultado('QR Code lido', nome, { nome, validade: /^\d{4}-\d{2}-\d{2}$/.test(validade || '') ? validade : '', origem: 'qr' });
    return;
  }
  mensagem('Buscando produto…');
  const produto = await buscarProduto(conteudo);
  mensagem('');
  mostrarResultado(produto ? 'Produto encontrado' : 'Código lido', produto ? `${produto.nome}${produto.quantidade ? ' · ' + produto.quantidade : ''}` : `Não encontramos o produto ${conteudo}. Você pode cadastrar manualmente.`, produto ? { nome: produto.nome, quantidade: produto.quantidade, origem: 'codigo' } : { origem: 'codigo' });
};
const pararCamera = async () => {
  if (leitor) { try { await leitor.stop(); leitor.clear(); } catch (erro) { leitor = null; } leitor = null; }
  obter('botao-iniciar').hidden = false;
  obter('botao-parar').hidden = true;
};
const iniciarCamera = async () => {
  if (typeof Html5Qrcode === 'undefined') { mensagem('Não foi possível carregar o leitor. Verifique a internet ou digite o código ao lado.', true); return; }
  try {
    leitor = new Html5Qrcode('leitor');
    await leitor.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 260, height: 180 } }, (texto, resultado) => {
      const formato = resultado && resultado.result && resultado.result.format ? resultado.result.format.formatName : '';
      pararCamera();
      tratarLeitura(texto, formato === 'QR_CODE');
    }, () => {});
    obter('botao-iniciar').hidden = true;
    obter('botao-parar').hidden = false;
    mensagem('Aponte para o código de barras ou QR Code.');
  } catch (erro) {
    leitor = null;
    mensagem('Não foi possível usar a câmera. Permita o acesso ou digite o código ao lado.', true);
  }
};
obter('botao-iniciar').addEventListener('click', iniciarCamera);
obter('botao-parar').addEventListener('click', pararCamera);
obter('formulario-codigo').addEventListener('submit', evento => { evento.preventDefault(); tratarLeitura(obter('codigo').value, false); });
window.addEventListener('pagehide', pararCamera);