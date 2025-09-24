# Usar imagem oficial do Node.js LTS baseada em Alpine Linux (menor tamanho)
FROM node:18-alpine

# Definir diretório de trabalho dentro do container
WORKDIR /app

# Copiar arquivos de dependências primeiro (para otimizar cache do Docker)
COPY package*.json ./

# Instalar dependências de produção
# --only=production instala apenas dependências necessárias para produção
# --silent reduz logs durante a instalação
RUN npm ci --only=production --silent

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copiar código fonte da aplicação
COPY src/ ./src/

# Definir propriedade dos arquivos para o usuário nodejs
RUN chown -R nodejs:nodejs /app

# Mudar para usuário não-root
USER nodejs

# Expor porta da aplicação
EXPOSE 3000

# Definir variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]

# Labels para metadados da imagem
LABEL maintainer="Sistema de Ônibus"
LABEL version="1.0.0"
LABEL description="Backend do Sistema de Gerenciamento de Rotas de Ônibus"

