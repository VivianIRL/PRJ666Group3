FROM node:20-alpine

# 1. Create a group and user
RUN addgroup -S nonroot && adduser -S nonroot -G nonroot

WORKDIR /app

# 2. Set ownership and install dependencies
COPY --chown=nonroot:nonroot package*.json ./
RUN npm install

# 3. Copy source code
COPY --chown=nonroot:nonroot . .

# 4. Switch to non-root user
USER nonroot

# Cloud Run defaults to 8080. If your server.js uses 5000, 
# you MUST ensure your server.js listens on the PORT environment variable
# provided by Cloud Run, or change this to 8080.
EXPOSE 8080

# Use the PORT environment variable if available, otherwise default to 8080
ENV PORT=8080

CMD ["node", "server.js"]