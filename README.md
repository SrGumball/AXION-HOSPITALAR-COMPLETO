# Axion Saúde 💊

![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-green)
![Versão](https://img.shields.io/badge/vers%C3%A3o-0.1.0-blue)
![Plataformas](https://img.shields.io/badge/plataformas-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

**Axion Saúde** é um sistema moderno de gestão de estoque farmacêutico. Desenvolvido com uma interface rica e responsiva, o aplicativo funciona de forma rápida e segura graças à arquitetura Tauri que une a performance do Rust ao ecossistema do React.

## ✨ Recursos

- **Dashboard Intuitivo:** Visão geral em tempo real de entradas, saídas e estado atual do estoque.
- **Gestão Completa de Estoque:** Cadastro de medicamentos, lotes e categorias com acompanhamento de validades.
- **Movimentações:** Registro simplificado de entradas e saídas.
- **Controle de Empréstimos e Fornecedores:** Gerencie o relacionamento e o fluxo com fornecedores e diferentes alas hospitalares.
- **Relatórios Avançados:** Exporte os dados e gere relatórios precisos do seu inventário.
- **Multiplataforma:** Suporte nativo para Windows, macOS e Linux com atualizações automatizadas e instaladores prontos.
- **Offline First:** O banco de dados SQLite fica salvo localmente com total privacidade, não exigindo configurações complexas para iniciar.

## 🚀 Tecnologias Utilizadas

- **Frontend:**
  - React 18 + Vite
  - Tailwind CSS + shadcn/ui (Radix UI) para componentes acessíveis e elegantes
  - Framer Motion para animações suaves
  - React Router DOM para navegação
- **Backend/Desktop:**
  - Tauri v2 (Rust) para criação dos executáveis nativos
- **Banco de Dados:**
  - SQLite (Armazenamento local seguro gerenciado pelo Tauri)

## 📦 Instalação e Execução Local

Siga as instruções abaixo para executar o projeto no seu ambiente de desenvolvimento.

### Pré-requisitos
- [Node.js](https://nodejs.org/en/) (Versão 20 ou superior)
- [Rust](https://www.rust-lang.org/tools/install) (Com Cargo e demais ferramentas de compilação instaladas)

### Passos

1. Instale as dependências do Frontend:
   ```bash
   npm install
   ```

2. Inicie o ambiente de desenvolvimento (Inicia o Vite e o backend Tauri em conjunto):
   ```bash
   npm run tauri dev
   ```

## 🛠️ Build Multiplataforma

Este repositório está configurado para gerar executáveis para **Windows, macOS e Linux** automaticamente através do GitHub Actions! 

Sempre que um novo código for adicionado à branch `main`, as pipelines irão compilar o software para as 3 plataformas e criar uma nova Release.

Para fazer o build manual na sua máquina, rode:
```bash
npm run tauri build
```
O executável final será gerado em `src-tauri/target/release/bundle/`.

---

Desenvolvido com dedicação para agilizar a gestão farmacêutica no dia a dia.
