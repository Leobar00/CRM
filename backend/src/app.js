const https = require('http');
const path = require('path');
const fs = require('fs');
const { request } = require('https');

// Configurazione delle porte
const PORT = process.env.PORT || 3000; // Porta per servire il frontend e fare da proxy
const BACKEND_PORT = 5000; // Porta interna del backend

// Percorso alla cartella build del frontend
const FRONTEND_BUILD_PATH = path.resolve(__dirname, '../../frontend/build/');

// Leggi i certificati SSL/TLS
const options = {
    key: fs.readFileSync(path.resolve(__dirname, './certificates/server.key')), // Chiave privata
    cert: fs.readFileSync(path.resolve(__dirname, './certificates/server.cert')), // Certificato
  };
  

// Origini consentite per CORS
const ALLOWED_ORIGINS = ['http://localhost:3000'];

// Funzione per servire file statici
const serveStaticFile = (filePath, response) => {
  const safePath = path.resolve(FRONTEND_BUILD_PATH, `.${path.sep}${filePath}`);
  if (!safePath.startsWith(FRONTEND_BUILD_PATH)) {
    response.writeHead(403, { 'Content-Type': 'text/plain' });
    return response.end('Accesso non autorizzato');
  }

  fs.readFile(safePath, (err, data) => {
    if (err) {
      console.error(`Errore nel servire il file: ${safePath}`, err);
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end('Errore: file non trovato');
    } else {
      const ext = path.extname(filePath);
      const contentType = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
      }[ext] || 'text/plain';

      response.writeHead(200, { 'Content-Type': contentType });
      response.end(data);
    }
  });
};

// Funzione per verificare CORS
const checkCors = (origin) => {
  return ALLOWED_ORIGINS.includes(origin);
};

// Crea il server HTTP
const server = https.createServer(options,(req, res) => {
  const origin = req.headers.origin;

  // Controllo CORS
  if (!checkCors(origin)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Origine non autorizzata');
  }

  if (req.url.startsWith('/api')) {
    // Proxy per le richieste API al backend
    const proxyReq = request(
      `https://localhost:${BACKEND_PORT}${req.url}`,
      {
        method: req.method,
        headers: {
          'Content-Type': req.headers['content-type'] || '',
          'Authorization': req.headers['authorization'] || '',
        },
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      }
    );

    req.pipe(proxyReq, { end: true });
  } else {
    // Serve i file statici di React
    const filePath = req.url === '/' ? 'index.html' : req.url;
    serveStaticFile(filePath, res);
  }
});

// Avvia il server
server.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);
});
