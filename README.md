# 🚗 Estacionamento Web

Sistema web de controle de estacionamento, com registro de entrada e saída de veículos, emissão de tickets para impressão e um painel de relatórios com gráficos de movimento e faturamento.

Este repositório é o **frontend** da aplicação, construído em Next.js. Ele consome uma API externa (backend) para autenticação, registro de entradas/saídas e geração de relatórios.

## ✨ Funcionalidades

- **Login** com autenticação via token (JWT), persistido em `localStorage`, com redirecionamento automático para o dashboard caso já exista sessão ativa.
- **Registro de entrada**: cadastro de placa, tipo de veículo (carro pequeno, carro grande ou moto), marca e modelo — com marcas/modelos buscados dinamicamente na [API FIPE (parallelum.com.br)](https://parallelum.com.br/fipe/api/).
- **Registro de saída**: busca por ID do ticket ou placa, com preview do valor a pagar antes de confirmar.
- **Impressão de ticket**: geração de um comprovante simples (via `window.print()`) tanto na entrada quanto na saída, com opção de reimpressão do último ticket.
- **Relatórios** (`/relatorios`): filtro por período e tipo de veículo, cards de total de veículos e faturamento, gráficos de movimento por hora e por dia (Recharts), horário de pico e ranking das marcas mais frequentes.

## 🛠 Stack técnica

- [Next.js 14](https://nextjs.org/) (App Router)
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Recharts](https://recharts.org/) para os gráficos de relatórios

## 📁 Estrutura do projeto

```
estacionamento-web-main/
├── app/
│   ├── page.tsx              # Tela de login
│   ├── layout.jsx            # Layout raiz (metadata, HTML base)
│   ├── dashboard/
│   │   └── page.tsx          # Registro de entrada/saída e impressão de tickets
│   └── relatorios/
│       └── page.tsx          # Painel de relatórios e gráficos
├── lib/
│   └── auth.ts               # Helpers de token (get/set/logout)
├── public/
│   └── bg.jpg                # Imagem de fundo do dashboard
├── next.config.js
├── postcss.config.mjs
└── package.json
```

## 🔌 API / Backend

O frontend consome uma API própria hospedada no Railway:

```
https://estacionamento-production-fe0e.up.railway.app
```

Endpoints utilizados:

| Rota          | Método | Descrição                                          |
|---------------|--------|-----------------------------------------------------|
| `/login`      | POST   | Autentica o usuário e retorna um token              |
| `/entrada`    | POST   | Registra a entrada de um veículo                     |
| `/saida`      | POST   | Consulta/finaliza a saída de um veículo (por ID ou placa) |
| `/relatorios` | POST   | Retorna dados agregados para o painel de relatórios  |

> ⚠️ A URL da API está atualmente fixa (hardcoded) no código de cada página. Para trocar de ambiente (dev/produção), considere extrair essa URL para uma variável de ambiente (`NEXT_PUBLIC_API_URL`).

## 🚀 Como rodar localmente

Pré-requisitos: [Node.js](https://nodejs.org/) 18+ e npm.

```bash
# instalar dependências
npm install

# rodar em modo desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

Outros scripts disponíveis:

```bash
npm run build   # build de produção
npm run start   # inicia o servidor de produção (após o build)
```

## 🔐 Autenticação

O token retornado pelo backend é armazenado em `localStorage` (`lib/auth.ts`) e enviado como `Authorization: Bearer <token>` nas requisições protegidas. As páginas `/dashboard` e `/relatorios` verificam a presença do token no carregamento e redirecionam para o login (`/`) caso ele não exista.

## 📌 Notas e possíveis melhorias

- Extrair a URL base da API para variável de ambiente.
- Adicionar tratamento de expiração/renovação de token.
- Adicionar testes automatizados.
- Revisar acessibilidade (labels nos inputs, contraste de cores).
