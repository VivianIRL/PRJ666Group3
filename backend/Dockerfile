FROM node:20-alpine

# 1. Create a group and user
RUN addgroup -S nonroot && adduser -S nonroot -G nonroot

WORKDIR /app

# 2. Set ownership of the app directory to the new user
COPY --chown=nonroot:nonroot package*.json ./
RUN npm install

# 3. Copy source code and ensure the user owns it
COPY --chown=nonroot:nonroot . .

# 4. Switch to the non-root user
USER nonroot

EXPOSE 5000

CMD ["node", "server.js"]