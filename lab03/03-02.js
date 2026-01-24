const http = require('http');
const url = require('url');

function factorial(k) {
    if (k < 0) return 0;
    if (k === 0 || k === 1) return 1;
    return k * factorial(k - 1);
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    if (parsedUrl.pathname === '/fact' && req.method === 'GET') {
        const k = parseInt(parsedUrl.query.k);
        
        if (isNaN(k) || k < 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid parameter k' }));
            return;
        }
        
        const fact = factorial(k);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ k: k, fact: fact }));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(5000, () => {
    console.log('Сервер запущен на http://localhost:5000');
});