# Usa la imagen oficial de Node.js en su versión ligera Alpine
FROM node:20-alpine

# Define el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de configuración de dependencias al contenedor
COPY package*.json ./

# Instala todas las dependencias requeridas (incluyendo las de desarrollo)
RUN npm install

# Copia el código fuente completo del proyecto al contenedor
COPY . .

# Expone el puerto 3000 para que el contenedor reciba el tráfico de la API
EXPOSE 3000

# Arranca la aplicación en modo desarrollo con hot reload automático de NestJS
CMD ["npm", "run", "start:dev"]