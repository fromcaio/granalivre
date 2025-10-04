# 1. Imagem Base
# Usamos uma imagem oficial do Node.js na versão LTS. "alpine" é uma versão mínima.
FROM node:18-alpine

# 2. Define o diretório de trabalho
WORKDIR /app

# 3. Copia os arquivos de dependência e instala
# Usamos o mesmo truque do cache do Docker para as dependências do Node.js
COPY package*.json ./
RUN npm install

# 4. Copia o código-fonte da aplicação
COPY . .

# Expõe a porta que o Next.js usa para desenvolvimento
EXPOSE 3000

# 5. Define o comando padrão para iniciar o servidor de desenvolvimento
CMD ["npm", "run", "dev"]