# 1. Imagem Base
# Usamos uma imagem oficial do Python. A versão "slim" é mais leve.
FROM python:3.11-slim

# Define variáveis de ambiente
# PYTHONUNBUFFERED garante que os logs apareçam em tempo real no terminal do Docker.
ENV PYTHONUNBUFFERED 1

# 2. Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# 3. Copia e instala as dependências
# Copiamos primeiro o requirements.txt para aproveitar o cache do Docker.
# A instalação só será refeita se este arquivo mudar.
COPY requirements.txt .
RUN pip install -r requirements.txt

# 4. Copia o resto do código da aplicação
COPY . .

# A porta 8000 será exposta. O docker-compose fará o mapeamento para a sua máquina.
EXPOSE 8000

# O comando para iniciar a aplicação será definido no docker-compose.yml