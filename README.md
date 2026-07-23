# 🏥 Axion Hospitalar Completo & Gerador Key

Bem-vindo ao repositório oficial do sistema **Axion Hospitalar**! Este repositório é um *monorepo* que contém duas aplicações principais focadas na gestão hospitalar e controle de licenças.

![Banner](https://img.shields.io/badge/Status-Ativo-success?style=for-the-badge)
![Tauri](https://img.shields.io/badge/Tauri-v2-blue?style=for-the-badge&logo=tauri)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-6-purple?style=for-the-badge&logo=vite)

---

## 📂 Estrutura do Projeto (Monorepo)

Este repositório foi organizado para conter múltiplas aplicações em um único lugar, facilitando a manutenção e a integração contínua (CI/CD):

- 📁 **`AXION-HOSPITALAR-COMPLETO/`**: Aplicação principal de gestão hospitalar. Inclui módulos para recepção, alas, controle de estoque (entradas/saídas/empréstimos/devoluções), gestão de medicamentos, dashboard analítico e relatórios.
- 📁 **`gerador-key/`**: Aplicação utilitária responsável pela geração de chaves (keys) de licença para validar a utilização do sistema principal.

---

## 🛠️ Tecnologias Utilizadas

As duas aplicações são construídas utilizando o que há de mais moderno em desenvolvimento de software *Desktop*:

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) e componentes acessíveis baseados no Radix UI.
- **Backend/Desktop**: [Tauri v2](https://v2.tauri.app/) (Rust) - Permite que a aplicação web rode nativamente no computador de forma leve, rápida e segura.
- **Banco de Dados/Sync**: Firebase e banco de dados local (SQLite) gerenciado pelo Tauri.

---

## ⚙️ Compilação Automática (CI/CD)

Este repositório está configurado com **GitHub Actions**. Sempre que uma alteração é enviada (`push`), os robôs do GitHub automaticamente preparam e compilam as aplicações.

Para lançar uma nova versão e disponibilizar os instaladores oficiais para **Windows (`.exe`, `.msi`)**, **Mac (`.app`, `.dmg`)** e **Linux (`.deb`, `.AppImage`)**, basta criar uma *Tag* de versão:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Isso fará com que o GitHub crie automaticamente uma **Release** (Lançamento) na aba *Releases* contendo todos os instaladores para download!

---

## 🏃‍♂️ Como rodar localmente (Desenvolvedores)

Se você é um desenvolvedor e deseja rodar os projetos no seu computador:

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 20+)
- [Rust](https://rustup.rs/) (Necessário para compilar o Tauri)

### 2. Rodando o Sistema Principal (Axion Hospitalar)
```bash
cd AXION-HOSPITALAR-COMPLETO
npm install
npm run tauri dev
```

### 3. Rodando o Gerador de Keys
```bash
cd gerador-key
npm install
npm run tauri dev
```

---
Feito com ❤️ por **SrGumball** e Equipe.
