# Usa un'immagine ufficiale di Node.js
FROM node:18-alpine

# Imposta la directory di lavoro all'interno del container
WORKDIR /app

# Copia il backend nel container
COPY backend/package*.json ./backend/
COPY backend/src ./backend/src

# Installa le dipendenze del backend
RUN cd backend && npm install

# Copia il frontend nel container
COPY frontend/package*.json ./frontend/
COPY frontend ./frontend

# Genera la build del frontend
RUN cd frontend && npm install && npm run build

# Sposta la build del frontend nella directory del backend
#RUN mv ./frontend/build ./backend/build

# Espone la porta per il server Node.js
EXPOSE 3000

# Imposta il comando di avvio
CMD ["node", "backend/src/app.js"]
