Validade Inteligente

Site que ajuda as pessoas a controlar a validade dos alimentos que têm em casa, receber alertas, organizar a lista de compras e encontrar receitas com o que está na despensa. O objetivo é reduzir o desperdício de alimentos, em alinhamento ao ODS 12 da ONU (consumo e produção responsáveis).

Projeto Frontend da disciplina INFO 62 · Curso Técnico em Informática · Escola Técnica Estadual Monteiro Lobato · Taquara, 2026.

Links de acesso
Item	Endereço
Site publicado	https://note-pixel.github.io/Validade-inteligente-site/
Repositório público	https://github.com/Note-pixel/Validade-inteligente-site
Checklist dos 5 critérios de avaliação

Critério	O site atende?	Por quê	Como verificar
1. Deploy e funcionamento	Sim	O projeto é estático (HTML, CSS e JavaScript puros), com index.html na raiz e caminhos relativos para o CSS (css/style.css) e para os scripts (js/). Os scripts usam defer e não há pastas expostas nem dependência de servidor.	Abrir o link publicado, conferir que a página carrega com estilo e abrir a aba Network (F12) sem arquivos com falha.
2. Interatividade sem recarregamento	Sim	Todos os formulários (entrar, criar conta, cadastrar e editar alimento, busca, lista de compras, receitas, perfil, comandos da Alexa) usam preventDefault() e atualizam a tela por manipulação do DOM. Cadastrar, editar e excluir não recarregam a página.	Cadastrar um alimento na página Cadastrar, editar na Despensa e excluir, observando que a página não recarrega.
3. Persistência de dados	Sim	Usuário, sessão, preferências, alimentos, histórico, lista de compras e receitas próprias ficam no localStorage, com chaves em português e tratamento de dados ausentes ou inválidos.	Cadastrar um alimento, apertar F5 e conferir que ele continua na Despensa. Ver as chaves em F12 > Application > Local Storage.
4. Estabilidade do console	Sim	O acesso ao armazenamento e às APIs do navegador é protegido por try/catch. Cada script verifica se os elementos existem antes de usá-los, e o conteúdo digitado pelo usuário é escapado antes de ser exibido.	Abrir F12 > Console e navegar por todas as páginas e funções, sem mensagens em vermelho.
5. Adaptabilidade e responsividade	Sim	No celular há barra de navegação inferior e uma coluna; em telas maiores, menu lateral e colunas (pontos de quebra em 600, 768, 900 e 1024 px). Não há rolagem horizontal. Imagens têm texto alternativo, os campos têm rótulos associados, há link para pular ao conteúdo, foco visível, mensagens de erro lidas por leitores de tela e respeito à preferência por menos movimento.	F12 > modo celular, testar 360 px, 768 px e 1280 px. Navegar só com o teclado (Tab).
Funcionalidades
Página inicial de apresentação, criação de conta e entrada demonstrativas.
Painel com resumo da despensa e do que vence primeiro.
Cadastro, edição, exclusão, busca e filtro de alimentos, com categorias e datas de validade.
Alertas calculados a partir das datas de validade e da antecedência escolhida no perfil.
Lista de compras: adicionar, editar quantidade, marcar como comprado e remover.
Receitas com sugestões calculadas a partir dos alimentos da despensa, destacando os que vencem logo.
Indicadores de impacto: alimentos aproveitados e descartados.
Perfil editável e preferências de alertas.
Escaneamento de produtos com alternativa de preenchimento manual.
Interface demonstrativa da Alexa.
Página de ajuda e página de erro amigável.
Estrutura de pastas
text
validade-inteligente/
├── index.html
├── ajuda.html
├── alertas.html
├── alexa.html
├── cadastrar.html
├── cadastro.html
├── compras.html
├── criarconta.html
├── despensa.html
├── entrar.html
├── escanear.html
├── impacto.html
├── inicio.html
├── login.html
├── pagerro.html
├── perfil.html
├── receitas.html
├── css/
│   └── style.css
├── js/
│   ├── alertas.js
│   ├── alexa.js
│   ├── app.js
│   ├── auth.js
│   ├── cadastrar.js
│   ├── despensa.js
│   ├── impacto.js
│   ├── inicio.js
│   ├── perfil.js
│   ├── receitas.js
│   └── transicao.js
└── img/
Papel de cada página
Página	Finalidade
index.html	Apresentação pública do projeto
entrar.html	Entrada do usuário (login.html redireciona para ela)
criarconta.html	Criação de conta (cadastro.html redireciona para ela)
inicio.html	Painel principal do usuário
despensa.html	Lista, busca, filtro, edição e exclusão de alimentos
cadastrar.html	Cadastro e edição de um alimento
alertas.html	Alimentos próximos do vencimento e vencidos
receitas.html	Receitas e sugestões com base na despensa
compras.html	Lista de compras
impacto.html	Indicadores de aproveitamento e desperdício
escanear.html	Leitura de produto com alternativa manual
alexa.html	Demonstração da integração com a Alexa
perfil.html	Dados do usuário e preferências
ajuda.html	Orientações de uso
pagerro.html	Página de erro amigável
Armazenamento local
Chave	Conteúdo
validade:usuario	Dados da conta demonstrativa
validade:sessao	Estado da sessão local
validade:preferencias	Antecedência dos alertas, horário do lembrete e avisos
validade:alimentos	Alimentos cadastrados
validade:historico	Alimentos consumidos e descartados
validade:compras	Lista de compras
validade:receitasProprias	Receitas cadastradas pelo usuário
