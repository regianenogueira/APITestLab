# Usar a imagem oficial do Node.js como base
FROM node:14

# Definir o diretório de trabalho no contêiner
WORKDIR /usr/src/app

# Copiar o package.json e o package-lock.json para o diretório de trabalho
COPY api/package*.json ./

# Instalar as dependências (incluindo o JSON Server)
RUN npm install

# Copiar os arquivos db.json e server.js para o diretório de trabalho
COPY api/db.json ./
COPY api/server.js ./

# Expor a porta em que o JSON Server será executado
EXPOSE 3000

# Comando para executar o JSON Server
CMD ["npx", "json-server", "--watch", "db.json", "--port", "3000"]