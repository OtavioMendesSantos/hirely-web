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
