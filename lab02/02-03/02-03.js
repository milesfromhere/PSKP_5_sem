// 3. ответ с ФИО
const http = require('http');

const server = http.createServer((req, res) => {
    if (req.url === '/api/name' && req.method === 'GET') {
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