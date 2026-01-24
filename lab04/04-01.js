var http = require('http');
var url = require('url');
var util = require('util');
var fs = require('fs');
var ee = require('events');
var data = require('./db');
var db = new data.DB();

db.on('GET', (req, res)=>{
    console.log('DB.GET'); 
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(db.select()));});
db.on('POST', (req, res)=>{
    console.log('DB.POST');
    req.on('data', data=>{
        let r = JSON.parse(data);
        db.insert(r);
        res.end(JSON.stringify(r));
    });
});
db.on('PUT', (req, res)=>{
    console.log('DB.PUT');
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        let r = JSON.parse(body);
        let result = db.update(r);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(result || {error: 'Not found'}));
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
    if(url.parse(request.url).pathname == '/api/db'){
        db.emit(request.method, request, response);
    }
}).listen(5000);

console.log('Server running at http://localhost:5000/api/db');