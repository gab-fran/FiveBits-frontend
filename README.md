# MedFlow frontend — refactor-codex

Base: main, commit `3ba9661d821a6ba1913a4535ab3e116b3b747d18`.
React, TypeScript, Vite e PrimeReact preservados. Node 24 recomendado.

```sh
npm ci
cp .env.example .env
# Ajuste VITE_SERVER_URL no .env, se necessário.
npm run dev
npm run build
npm run lint
```

Configure VITE_SERVER_URL antes do build para apontar à API correspondente; não use o backend publicado antigo com estes contratos. O fallback histórico de AppConfig foi preservado. A API deve ter as migrations da branch refactor-codex; consulte o README do backend.

## Fluxos e validações

`/cadastro/paciente` é público e cria uma conta com e-mail/senha. O administrador é o único perfil com cadastro e edição de médicos. Pacientes acessam seus dados e consultas; médicos acessam seus atendimentos. O backend aplica a autorização de forma independente das telas.

Formulários de criação e edição usam os mesmos validadores: obrigatoriedade, tipos, limites, CPF com dígitos verificadores, CRM número/UF, calendário real, nascimento não futuro, moeda e duração inteira positiva. Máscaras são apresentação; a API revalida o payload. As mensagens aparecem junto aos campos, com aria-invalid, descrição acessível e foco no primeiro erro. Falhas da API são preservadas e exibidas; botões de envio evitam cliques repetidos enquanto a operação está em andamento.

Agendamentos usam data/hora de Brasília, duração em minutos e intervalo exclusivo no final (09:00–09:45 permite outra consulta às 09:45). O paciente não pode ser substituído na edição. O horário digitado é enviado com offset, e a leitura para edição é feita com America/Sao_Paulo. Data de nascimento é uma data civil, não um instante. Consultas encerradas continuam sujeitas às regras da API.

O cliente HTTP centraliza JSON, erros e expiração de sessão. Tokens e respostas de login não são impressos. localStorage é mantido para compatibilidade; a verificação local serve somente à navegação. Nenhuma decisão de autorização depende dela no servidor.

Os validadores em `src/validation/inputs.ts` têm a mesma implementação do backend, sem introduzir um pacote compartilhado entre repositórios independentes. Mudanças de contrato precisam ser aplicadas em ambos; o teste de contrato verifica essa igualdade.

## Testes reais no navegador

```sh
npm test
```

Playwright é uma dependência exclusivamente de desenvolvimento. O teste inicia Vite na porta 5174 e a API do checkout irmão `../FiveBits-backend` na 3334. PostgreSQL deve estar disponível; o runner cria e remove um banco descartável, sem tocar no banco da aplicação. São usadas credenciais sintéticas somente no teste.

No ambiente preparado, Chromium está em `/usr/bin/chromium`. Para outra instalação, defina `CHROMIUM_PATH`. As variáveis PostgreSQL são `TEST_DB_HOST`, `TEST_DB_PORT`, `TEST_DB_USER`, `TEST_DB_PASSWORD`, `TEST_DB_ADMIN`, `PSQL_BIN`, documentadas no backend. As portas de teste devem estar livres.

Cobertura: cadastro público com CPF inválido sem envio à API, cadastro válido e login, acesso por perfil, criação de médico, consulta gratuita, duração variável, horário preservado na edição, bloqueio de desativação e sessão malformada. Os testes usam a API e o banco reais, sem mocks para esses fluxos.

Escopo v2: disponibilidade/feriados, financeiro, convênios, mensagens de e-mail/SMS e documentos PDF. A recuperação de senha informa o contato com a clínica; não há rota fictícia de recuperação automática.

Publicação após revisão: `git push -u origin refactor-codex`.
