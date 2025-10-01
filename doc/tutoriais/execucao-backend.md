# Como Executar o Backend (Django)

Este guia descreve os passos necessários para configurar e executar o projeto backend Django após clonar o repositório.

## Pré-requisitos

Certifique-se de que as seguintes ferramentas estão instaladas em sua máquina:
- **Python 3.8+**
- **pip** (gerenciador de pacotes do Python)

## Passos para Execução

1.  **Navegue até a pasta do backend:**
    Abra o seu terminal e vá para o diretório do backend:

    ```bash
    cd codigo/backend
    ```

2.  **Crie um ambiente virtual:**
    É uma boa prática isolar as dependências do projeto. Crie um ambiente virtual dentro da pasta do backend.

    ```bash
    python -m venv venv
    ```

3.  **Ative o ambiente virtual:**
    -   **No Windows:**
        ```bash
        .\\venv\\Scripts\\activate
        ```
    -   **No macOS/Linux:**
        ```bash
        source venv/bin/activate
        ```

    Você saberá que o ambiente está ativo pois o nome dele (`(venv)`) aparecerá no início do seu terminal.

4.  **Instale as dependências:**
    O arquivo `requirements.txt` contém todas as bibliotecas Python necessárias.

    ```bash
    pip install -r requirements.txt
    ```

5.  **Aplique as migrações do banco de dados:**

    Este comando cria as tabelas do banco de dados com base nos modelos Django.

    ```bash
    python manage.py migrate
    ```

6.  **Crie um superusuário (opcional):**

    Isso é útil para acessar o painel de administração do Django.

    ```bash
    python manage.py createsuperuser
    ```

    Siga as instruções para criar um nome de usuário, e-mail e senha.

7.  **Execute o servidor de desenvolvimento:**

    ```bash
    python manage.py runserver
    ```

    Por padrão, o servidor estará disponível em `http://127.0.0.1:8000/`.