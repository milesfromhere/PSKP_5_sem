var http = require('http');
var url = require('url');
var util = require('util');
var fs = require('fs');
var path = require('path'); // Добавляем модуль path для работы с путями
var ee = require('events');
var data = require('./db');
var db = new data.DB();

db.on('GET', (req, res)=>{
    console.log('DB.GET'); 
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(db.select()));
});

db.on('POST', (req, res)=>{
    console.log('DB.POST');
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        try {
            let r = JSON.parse(body);
            db.insert(r);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(r));
        } catch (error) {
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Invalid JSON'}));
        }
    });
});

db.on('PUT', (req, res)=>{
    console.log('DB.PUT');
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        try {
            let r = JSON.parse(body);
            let result = db.update(r);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(result || {error: 'Not found'}));
        } catch (error) {
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Invalid JSON'}));
        }
    });
});

db.on('DELETE', (req, res)=>{
    console.log('DB.DELETE');
    let query = url.parse(req.url, true).query;
    let id = parseInt(query.id);
    let result = db.delete(id);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(result || {error: 'Not found'}));
});

http.createServer(function(request, response){
    const parsedUrl = url.parse(request.url);
    
    if(parsedUrl.pathname === '/'){
        // Используем путь относительно текущей директории файла
        const htmlPath = path.join(__dirname, '04-02.html');
        console.log('Trying to read HTML from:', htmlPath);
        
        fs.readFile(htmlPath, function(err, html){
            if(err){
                console.error('Error reading HTML file:', err);
                response.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
                response.end('HTML file not found');
                return;
            }
            response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            response.end(html);
        });
    }
    else if(parsedUrl.pathname === '/api/db'){
        db.emit(request.method, request, response);
    }
    else {
        response.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
        response.end('Not Found');
    }
}).listen(5000);

console.log('Server running at http://localhost:5000/');
console.log('Server running at http://localhost:5000/api/db');