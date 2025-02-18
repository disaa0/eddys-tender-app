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

# Puerto expuesto y comando de inicio
EXPOSE 3000
EXPOSE 5555
CMD ["npm", "run", "dev"]
