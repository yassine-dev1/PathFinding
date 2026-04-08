# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY ./package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY ./ ./

# Build l'application React
RUN npm run build

# Stage 2: Production avec Nginx
FROM nginx:alpine

# Copier les fichiers buildés
COPY --from=builder /app/build /usr/share/nginx/html

# Copier la configuration nginx
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]