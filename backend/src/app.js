const http = require('http');
const path = require('path');
const fs = require('fs');
const { request } = require('http');

// Configurazione della porta
const PORT = process.env.PORT || 3000; // Porta per servire il frontend e fare da proxy
const BACKEND_PORT = 5000; // Porta interna del backend, se necessaria

// Percorso alla cartella build del frontend
const FRONTEND_BUILD_PATH = path.join(__dirname, '../../frontend/build/');

// Funzione per servire i file statici di React
const serveStaticFile = (filePath, response) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end('File not found');
    } else {
      const ext = path.extname(filePath);
      const contentType =
        ext === '.html' ? 'text/html' :
        ext === '.css'  ? 'text/css' :
        ext === '.js'   ? 'application/javascript' : 'text/plain';

      response.writeHead(200, { 'Content-Type': contentType });
      response.end(data);
    }
  });
};

// Crea il server HTTP
const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api')) {
    // Proxy per le richieste API al backend
    const proxyReq = request(
      `http://localhost:${BACKEND_PORT}${req.url}`,
      { method: req.method, headers: req.headers },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      }
    );

    req.pipe(proxyReq, { end: true });
  } else {
    // Serve i file statici di React
    const filePath = path.join(
      FRONTEND_BUILD_PATH,
      req.url === '/' ? 'index.html' : req.url
    );
    serveStaticFile(filePath, res);
  }
});

// Avvia il server
server.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);
});
