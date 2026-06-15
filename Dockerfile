FROM node:18-alpine
WORKDIR /app

# Copier package.json
COPY package*.json ./
RUN npm install --only=production

# Copier TOUT le code source
COPY . .

# Vérification avec les bons noms de fichiers
RUN echo "=== VÉRIFICATION FICHIERS ===" && \
    echo "Server.js:" && ls -la server.js && \
    echo "SellCarImages.model.js:" && find . -name "SellCarImages.model.js" && \
    echo "SellCarImage.controller.js:" && find . -name "SellCarImage.controller.js" && \
    echo "✅ Tous les fichiers vérifiés"

EXPOSE 3000

CMD ["node", "server.js"]