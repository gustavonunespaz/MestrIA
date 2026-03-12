# MestrIA
Uma plataforma web de RPG de mesa potencializada por Inteligência Artificial. A aplicação permite a criação de campanhas multiplayer em tempo real. O grande diferencial é a integração com LLMs, onde a IA atua como o Dungeon Master (Mestre), gerando narrativas dinâmicas, controlando NPCs, validando regras e respondendo às ações dos jogadores.

Documento de Visão e Arquitetura: Plataforma de RPG com IA Mestra
1. Visão Geral do Projeto
O projeto consiste em uma plataforma web de Virtual Tabletop (VTT) desenvolvida para gerenciar campanhas de RPG de mesa multiplayer em tempo real. O principal diferencial e núcleo tecnológico do sistema é a substituição do Mestre de Jogo (Dungeon Master) humano por um modelo de Inteligência Artificial (LLM). A IA será responsável por narrar a história, arbitrar as regras do sistema, controlar NPCs, reagir às decisões dos jogadores e gerar consequências dinâmicas, mantendo a coesão narrativa através do gerenciamento de contexto feito pelo nosso backend.

2. Stack Tecnológico Definido
A stack foi escolhida com base em modernidade, performance em tempo real e gratuidade/código aberto.

Frontend: React.js (inicializado via Vite para maior velocidade), utilizando TypeScript. Gerenciamento de estado complexo (fichas, chat e mapas) a ser definido (Zustand ou Redux).

Backend: Node.js com TypeScript. Framework web (Express ou Fastify).

Comunicação em Tempo Real: WebSockets (via Socket.io) para sincronização instantânea de rolagens de dados, mensagens de chat e atualizações de vida/status.

Banco de Dados: PostgreSQL, combinando estruturação relacional para entidades fixas e o tipo de dado JSONB para atributos dinâmicos e flexíveis de RPG.

ORM (Object-Relational Mapping): Prisma, garantindo tipagem estática ponta a ponta e migrações seguras do banco de dados.

Motores de Inteligência Artificial: Modelos Open Source (Llama 3 ou Mixtral).

3. Arquitetura de Inteligência Artificial (O Core do Sistema)
Como as LLMs são stateless (não possuem memória contínua das requisições anteriores), nosso backend em Node.js atuará como o "Cérebro de Contexto". A arquitetura de consumo de IA será baseada no padrão Circuit Breaker com Fallback Automático, garantindo custo zero e alta disponibilidade.

Estratégia de Redundância (Circuit Breaker):

Rota Principal (Cloud/API): O backend tentará primeiramente enviar o prompt para a API do Groq. O Groq hospedará nosso modelo Open Source escolhido, oferecendo respostas com latência ultrabaixa (quase instantâneas).

Tratamento de Erros: O Node.js monitorará o status HTTP da resposta. Se o Groq retornar 429 Too Many Requests (limite do plano gratuito atingido) ou estiver instável, o Circuit Breaker abre e intercepta a falha.

Rota Secundária (Fallback Local): Imediatamente, o backend redireciona a requisição, de forma transparente para os jogadores, para o Ollama, rodando localmente na sua máquina (via localhost:11434). A velocidade de geração de texto diminuirá (dependendo do seu hardware), mas a sessão de RPG não será interrompida. Quando a janela de tempo do Groq resetar, o sistema volta automaticamente para a Rota Principal.

Gerenciamento de Contexto (A Memória da IA):
A cada nova ação de um jogador, o Node.js montará um super-pacote de dados (O Prompt Mestre) contendo:
A instrução base de comportamento da IA (O "Persona" do Mestre).
O resumo dos acontecimentos da campanha até o momento.
O histórico das últimas 10-20 interações do chat (para coesão imediata).
Um objeto JSON atualizado com o HP, inventário e status do jogador que está agindo.
A ação/texto que o jogador acabou de enviar.

4. Modelagem Estrutural do Banco de Dados (PostgreSQL)
A base relacional garantirá a integridade, enquanto campos específicos usarão a flexibilidade do NoSQL dentro do Postgres.
Tabela Users: Autenticação, e-mail, senhas (hasheadas) e configurações de perfil.
Tabela Campaigns: O "Mundo". Terá um título, descrição, regras do sistema base (ex: D&D 5e, Tormenta) e uma chave de convite para multiplayer. Conterá um campo context_summary (um resumo gerado periodicamente pela própria IA para economizar tokens nas requisições futuras).

Tabela Characters: Vinculada aos Usuários e às Campanhas. Terá colunas fixas (Nome, Classe, Nível, HP Atual, HP Máximo) e um campo attributes em JSONB, permitindo que cada personagem tenha árvores de habilidades, inventários e feitiços com estruturas completamente diferentes, sem quebrar o banco.

Tabela Sessions/Messages: O histórico literal de tudo que foi dito e rolado. Relaciona quem enviou (Jogador X, Sistema/Bot de Dados, ou IA Mestra) com a Campanha e armazena o timestamp exato para ordenação no frontend.

5. O Fluxo de Interação (Ciclo de Vida de uma Ação)
Para deixar claro o que acontece por baixo dos panos durante a jogatina, este é o fluxo exato de uma rodada:
O Jogador A digita no frontend React: "Eu saco minha espada e ataco o Goblin".
O React envia essa ação para o Node.js via WebSocket.
O Node.js salva a mensagem no PostgreSQL e avisa todos os outros jogadores na sala: "O Jogador A está atacando".
O Node.js busca a ficha do Jogador A, os dados do Goblin e o histórico recente no banco.
O Node.js empacota tudo isso e dispara para a API do Groq.
Se o Groq falhar, o Node.js dispara o mesmo pacote para o Ollama local.
A IA (Groq ou Ollama) processa as regras e gera o texto de resposta: "O goblin tenta esquivar, mas você é mais rápido. Role 1d20 para acerto."

O Node.js recebe esse texto, salva no banco de dados como uma mensagem do System_DM e transmite via WebSocket para o frontend.

A tela de todos os jogadores atualiza em tempo real com a fala do Mestre.
