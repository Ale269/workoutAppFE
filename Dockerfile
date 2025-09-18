# FASE 1: Build dell'applicazione
FROM node:22 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build --configuration=docker

# FASE 2: Servire i file statici con Nginx
FROM nginx:alpine
# Copia il file di configurazione Nginx
COPY nginx.conf /etc/nginx/nginx.conf
# Copia i file di build dell'applicazione
COPY --from=build /app/dist/gymshark-frontend /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
