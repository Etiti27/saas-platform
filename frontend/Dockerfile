# Stage 1: Build Vite app
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:latest

# Copy custom NGINX config (supports SPA routing + caching)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output to NGINX root
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
