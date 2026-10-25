# ==========================================
# STAGE 1: Build React Application
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first for optimal Docker layer caching
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy source code and build production bundle
COPY . .
RUN npm run build

# ==========================================
# STAGE 2: Serve with Lightweight Nginx
# ==========================================
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom reverse proxy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
