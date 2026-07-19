# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /tmp/nginx.conf.template

RUN chown -R nginx:nginx /etc/nginx/conf.d

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 1. Update permissions for the non-root user
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /usr/share/nginx/html

# Create the temporary directories and set ownership
RUN mkdir -p /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp && \
    chown -R nginx:nginx /tmp
# 2. Switch to the non-root user
USER nginx

# 3. Expose the non-privileged port
EXPOSE 8080



CMD ["/entrypoint.sh"]