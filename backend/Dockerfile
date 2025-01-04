# Paso 1: Usa una imagen base de Node.js
FROM node:18 AS build

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos package.json y package-lock.json para instalar dependencias
COPY package*.json ./


# Instala las dependencias del backend
RUN npm install

# Copia todo el código fuente del backend al contenedor
COPY . .

ENV SECRET=$SECRET

ENV CORS_ORIGIN=$CORS_ORIGIN

ENV ATLAS_URI=$ATLAS_URI

# Exponer el puerto que la aplicación va a usar (por ejemplo, el 3000)
EXPOSE 3000

# Paso 2: Ejecutar la aplicación
CMD ["node", "src/app.js"]
