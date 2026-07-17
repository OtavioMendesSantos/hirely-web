# Hirely Web

Interface web moderna para o **Hirely**, uma plataforma de recrutamento e gestão de fluxo de trabalho (*Task Flow / Kanban*) focada em alta performance, minimalismo e excelente usabilidade. Construída como uma **Single Page Application (SPA)** reativa e tipada, tirando o máximo proveito do **Angular 22**.

---

## 🛠️ Tecnologias Utilizadas

- **[Angular 22](https://angular.dev/)** — Framework web de última geração (*Standalone Components*, *Signals*, *Control Flow* moderno e *Inject functions*).
- **[TypeScript](https://www.typescriptlang.org/)** — Tipagem estática robusta e segurança de código.
- **[Spartan / Helm](https://spartan.ng/)** — Biblioteca de componentes acessíveis e customizáveis (baseados no padrão *shadcn/ui* para Angular com Brain & Helm).
- **[Tailwind CSS](https://tailwindcss.com/)** + **[SASS](https://sass-lang.com/)** — Estilização utilitária e overrides de tokens `@theme` e CSS Variables de alta precisão.
- **[@ng-icons/core & lucide](https://ng-icons.github.io/ng-icons/)** — Conjunto de ícones vetoriais otimizados por árvore de injeção (*Lucide Icons*).
- **[Vitest](https://vitest.dev/)** — Framework de testes unitários ultrarrápido integrado com o ecossistema Angular.

---

## 🏗️ Arquitetura & Propósito dos Diretórios

O projeto segue estritamente o modelo de separação de responsabilidades recomendado pela documentação oficial do Angular e boas práticas de design moderno (*Domain-Driven / Standalone*):

### 🧠 `core/` — O Sistema Nervoso Central (*Stateful / Singletons*)
Destinado exclusivamente à **inteligência transversal** que a aplicação inteira compartilha. É o local das instâncias únicas (*Singletons* com `providedIn: 'root'`), gerenciamento de estado reativo (*Signals* globais), interceptadores de rede, proteção de rotas (*Guards*) e dos **componentes de Shell estrutural** (como o cabeçalho global). 
> **Regra de Ouro:** Qualquer componente que precise consumir ou alterar o estado global (ex: saber se o usuário está logado, alternar temas ou fazer logout) pertence conceitualmente ao `core/`, pois é reativo, inteligente e acoplado ao ecossistema da aplicação.

### 🧱 `shared/` — Peças de UI & Componentes "Burros" (*Stateless / Presentational*)
Destinado exclusivamente a **componentes visuais puros**, diretivas, ícones e primitivas de UI (*Dumb Components*). 
> **Regra de Ouro:** É totalmente previsível, isolado e agnóstico de regras de negócio. Um componente em `shared/` nunca injeta serviços de estado global ou faz chamadas de API. Ele se comunica com o restante do sistema única e exclusivamente por parâmetros de entrada (`input()`) e eventos de saída (`output()`).

### 🎯 `pages/` — Funcionalidades & Rotas (*Feature-Scoped Smart Components*)
Onde vivem as rotas e funcionalidades encapsuladas (como Autenticação, Dashboard ou Landing Page). Lógicas inteligentes específicas de uma funcionalidade — como salvar uma tarefa ou validar um formulário de edição — **não vão para o `core/`**; elas permanecem isoladas no escopo de sua própria página/funcionalidade.

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- **Node.js** (versão 20+ ou 22+ LTS)
- **npm**

### 1. Instalar as dependências
```bash
npm install
```

### 2. Iniciar o servidor de desenvolvimento
```bash
npm start
# ou executando diretamente via Angular CLI: ng serve
```
Abra o navegador em `http://localhost:4200/`. O servidor de desenvolvimento recarrega automaticamente a cada alteração no código.

---

## 🧪 Comandos Úteis

- **Rodar Testes Unitários (`Vitest`):**
  ```bash
  npm test
  # ou
  npx vitest run
  ```
- **Gerar Build de Produção:**
  ```bash
  npm run build
  ```
