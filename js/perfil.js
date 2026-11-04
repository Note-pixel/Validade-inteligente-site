'use strict';
const obter = id => document.getElementById(id);
const usuario = banco.usuario();
const configuracoes = banco.configuracoes();
obter('nome-perfil').value = usuario.nome;
obter('email-perfil').value = usuario.email || '';
obter('avisos').checked = configuracoes.avisos;
obter('antecedencia').value = String(configuracoes.antecedencia);
obter('horario').value = configuracoes.horario;
obter('chave-ia').value = configuracoes.chaveIA;
obter('modelo-ia').value = configuracoes.modeloIA;
const salvarConfiguracao = alteracoes => banco.salvarConfiguracoes(Object.assign({}, banco.configuracoes(), alteracoes));
obter('formulario-perfil').addEventListener('submit', evento => {
  evento.preventDefault();
  const nome = obter('nome-perfil').value.trim();
  if (nome.length < 2) { obter('erro-nome-perfil').textContent = 'Digite seu nome.'; obter('nome-perfil').setAttribute('aria-invalid', 'true'); obter('nome-perfil').focus(); return; }
  obter('erro-nome-perfil').textContent = '';
  obter('nome-perfil').removeAttribute('aria-invalid');
  banco.salvarUsuario(Object.assign({}, usuario, { nome }));
  avisar('Perfil atualizado');
});
obter('formulario-alertas').addEventListener('submit', evento => {
  evento.preventDefault();
  salvarConfiguracao({ antecedencia: Number(obter('antecedencia').value), horario: obter('horario').value || '18:00', avisos: obter('avisos').checked });
  avisar('Alertas atualizados');
});
obter('formulario-ia').addEventListener('submit', evento => {
  evento.preventDefault();
  salvarConfiguracao({ chaveIA: obter('chave-ia').value.trim(), modeloIA: obter('modelo-ia').value.trim() || 'gemini-2.5-flash' });
  avisar('Configuração da IA salva');
});
obter('botao-notificacao').addEventListener('click', async () => {
  if (!('Notification' in window)) { avisar('Seu navegador não oferece notificações'); return; }
  try {
    const permissao = await Notification.requestPermission();
    if (permissao !== 'granted') { avisar('Permissão não concedida'); return; }
    new Notification('Validade Inteligente', { body: 'Avisos ativados! Vamos lembrar o que vence.' });
    avisar('Avisos do navegador ativados');
  } catch (erro) { avisar('Não foi possível ativar os avisos neste aparelho'); }
});
obter('botao-apagar').addEventListener('click', () => {
  if (!window.confirm('Apagar todos os dados guardados neste navegador?')) return;
  banco.apagarTudo();
  avisar('Dados apagados');
  setTimeout(() => window.location.assign('index.html'), 800);
});
obter('botao-sair').addEventListener('click', () => {
  try { sessionStorage.removeItem('vi:sessao'); } catch (erro) { return; }
  window.location.assign('entrar.html');
});