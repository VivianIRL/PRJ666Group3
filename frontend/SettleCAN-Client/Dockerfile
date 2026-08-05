# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# Skip git hooks
RUN HUSKY=0 npm install
COPY . .
RUN npm run build


# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Copy your full config into the templates folder
COPY nginx.conf /etc/nginx/templates/nginx.conf.template

# Set permissions
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /usr/share/nginx/html /etc/nginx /tmp && \
    mkdir -p /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp && \
    chown -R nginx:nginx /tmp

# FORCE Nginx to save the processed file as the main nginx.conf file
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx

USER nginx
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]