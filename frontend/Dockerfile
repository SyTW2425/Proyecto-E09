# Paso 1: Usa una imagen de Node para construir la aplicación
FROM node:18-alpine AS build

# Configura el directorio de trabajo
WORKDIR /app

# Copia los archivos del proyecto al contenedor
COPY package*.json ./
COPY angular.json ./
COPY tsconfig*.json ./
COPY server.ts ./
COPY src ./src

# Instala las dependencias
RUN npm install

# Construye la aplicación para producción
RUN npm run build --omit=dev

# Paso 2: Usa una imagen de Nginx para servir la aplicación
FROM nginx:alpine

# Copia los archivos construidos al directorio predeterminado de Nginx
COPY --from=build /app/dist/frontend /usr/share/nginx/html

# Copia el archivo de configuración personalizado de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80 para el contenedor
EXPOSE 80

# Comando predeterminado para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]
