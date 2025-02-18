FROM node:18-alpine

WORKDIR /app

# Copia archivos de dependencias primero (para cachear)
COPY package*.json ./
COPY prisma ./prisma/

# Instala dependencias y genera el cliente de Prisma
RUN npm install
RUN npx prisma generate

# Copia el resto del código
COPY . .

# Script de inicio que incluye seed
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Puerto expuesto y comando de inicio
EXPOSE 3000
EXPOSE 5555

# Instalar netcat para script de espera
RUN apk add --no-cache netcat-openbsd

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]
