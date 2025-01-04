# Paso 1: Usa una imagen base de Node.js
FROM node:18-alpine AS build

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos package.json y package-lock.json para instalar dependencias
COPY package*.json ./


# Instala las dependencias del backend
RUN npm install

# Copia todo el código fuente del backend al contenedor
COPY . .

ENV SECRET="97e5a9c49e059d0aec06be4148c21b6ff8e9c68e9ec8ee78d230d8778a4443b4addd51147071fc80a315262ce08c77841f3c14942a37e524e35a670cc442c15ec3363d09749dc0411007156420b5b2a50163dd7e3f49c31df5748bcb027372b7df77db0732f52488b737aeb07f7d152a7d7db6ca3a8b5a3e373b9c41758c6c22e4c98e45775b0c87abbde5d0d0233438d6aea69e53fcb10d5fe267c638bb43d896301e5e1b764a6e87334fe4462873e7c3d35a7c9c463f7f1cd97142e9f7165d4df0009cc6cc10739b907a6af21142b625a000c7bc06d47ad8ddab0a264b2bfee2353ac0962a87254b1e2b9c539264ae260b5b0255dc8488d270c4d7d9467e8b"

ENV CORS_ORIGIN=http://10.6.128.240

ENV ATLAS_URI="mongodb://admin:canals@172.16.113.2/anitrackguess?retryWrites=true&w=majority"

# Exponer el puerto que la aplicación va a usar (por ejemplo, el 3000)
EXPOSE 3000

# Paso 2: Ejecutar la aplicación
CMD ["node", "src/app.js"]
