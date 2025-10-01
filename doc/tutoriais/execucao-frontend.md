# Como Executar o Frontend (Next.js)

Este guia descreve os passos para configurar e executar o projeto frontend em Next.js.

## Pré-requisitos

Certifique-se de que as seguintes ferramentas estão instaladas em sua máquina:
- **Node.js** (versão 14 ou superior)
- **npm** ou **yarn** (gerenciadores de pacotes JavaScript)

## Passos para Execução

1.  **Navegue até a pasta do frontend:**
    Abra o seu terminal e vá para o diretório do frontend:

    ```bash
    cd codigo/frontend
    ```

2.  **Instale as dependências do projeto:**
    Este comando lê o arquivo `package.json` e baixa todas as bibliotecas necessárias.

    -   **Usando npm:**
        ```bash
        npm install
        ```
    -   **Ou usando yarn:**
        ```bash
        yarn install
        ```

3.  **Execute o servidor de desenvolvimento:**

    -   **Usando npm:**
        ```bash
        npm run dev
        ```
    -   **Ou usando yarn:**
        ```bash
        yarn dev
        ```

    O servidor de desenvolvimento do Next.js geralmente estará disponível em `http://localhost:3000`.

## Scripts Úteis

Dentro do arquivo `package.json`, você pode encontrar outros scripts úteis:

-   `build`: Compila a aplicação para produção.
    ```bash
    npm run build
    ```
-   `start`: Inicia o servidor em modo de produção (requer um `build` prévio).
    ```bash
    npm run start
    ```
-   `lint`: Executa o linter para verificar a qualidade do código.
    ```bash
    npm run lint
    ```