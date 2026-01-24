// 4. Ответ с XmlHttpRequest
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    if (parsedUrl.pathname === '/xmlhttprequest' && req.method === 'GET') {
        const filePath = path.join(__dirname, 'xmlhttprequest.html');
        
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Ошибка чтения файла');
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });
    } else if (parsedUrl.pathname === '/api/name' && req.method === 'GET') {
        res.writeHead(200, { 
            'Content-Type': 'text/plain; charset=utf-8'
        });
        res.end('Бондарик Никита Дмитриевич');
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Страница не найдена');
    }
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});