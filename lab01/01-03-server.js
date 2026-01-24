const http = require('http');
const url = require('url');
const querystring = require('querystring');

const server = http.createServer((req, res) => {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        const parsedUrl = url.parse(req.url, true);
        const method = req.method;
        const headers = req.headers;
        
        const htmlResponse = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Информация о запросе</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .section { margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; }
        h2 { color: #333; }
        pre { background: #f4f4f4; padding: 10px; }
    </style>
</head>
<body>
    <h1>Информация о HTTP запросе</h1>
    
    <div class="section">
        <h2>Метод запроса:</h2>
        <p>${method}</p>
    </div>
    
    <div class="section">
        <h2>URI:</h2>
        <p>${req.url}</p>
    </div>
    
    <div class="section">
        <h2>Заголовки:</h2>
        <pre>${JSON.stringify(headers, null, 2)}</pre>
    </div>
    
    <div class="section">
        <h2>Query параметры:</h2>
        <pre>${JSON.stringify(parsedUrl.query, null, 2)}</pre>
    </div>
    
    <div class="section">
        <h2>Тело запроса:</h2>
        <pre>${body || 'Тело запроса пустое'}</pre>
    </div>
    
    <div class="section">
        <h2>HTTP версия:</h2>
        <p>${req.httpVersion}</p>
    </div>
</body>
</html>
        `;
        
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(htmlResponse);
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Сервер 01-03 запущен на порту ${PORT}`);
    console.log(`Проверьте: http://localhost:${PORT}`);
});