const http = require('http');
const DB = require('./DB');
const url = require('url');
const fs = require('fs');
const querystring = require('querystring');
const { clearInterval } = require('timers');

let db = new DB();

let statistics = {
    startTime: null,
    endTime: null,
    requestCount: 0,
    commitCount: 0,
    isActive: false
};

db.on('GET', (req, res) => {
    if (statistics.isActive) statistics.requestCount++;
    console.log('DB.GET');
    res.setHeader('Content-Type', 'application/json');
    db.select().then(elem => res.end(JSON.stringify(elem)));
});

db.on('POST', (req, res) => {
    if (statistics.isActive) statistics.requestCount++;
    console.log('DB.POST');
    req.on('data', data => {
        let r = JSON.parse(data);
        db.insert(r);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(r));
    });
});

db.on('PUT', (req, res) => {
    if (statistics.isActive) statistics.requestCount++;
    console.log('DB.PUT');
    req.on('data', data => {
        const r = JSON.parse(data);
        db.update(r);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(r));
    });
});

db.on('DELETE', (req, res) => {
    if (statistics.isActive) statistics.requestCount++;
    if (req.headers['content-type'] === 'text/plain') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const params = querystring.parse(body);
            const id = params.id;
            db.delete(id).then(data => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
            });
        });
    } else {
        const params = url.parse(req.url, true);
        const id = params.query.id;
        db.delete(id).then(data => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
        });
    }
});

db.on('COMMIT', async () => {
    if (statistics.isActive) statistics.commitCount++;
    await db.commit();
});

var server = http.createServer((req, res) => {
    const pathname = url.parse(req.url).pathname;

    if (pathname === '/') {
        fs.readFile('index.html', 'utf-8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Could not find file');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (pathname === '/api/db') {
        db.emit(req.method, req, res);
    } else if (pathname === '/api/ss') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(statistics));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Неверный путь запроса" }));
    }
}).listen(5000, () => {
    console.log('Сервер запущен! URL - http://localhost:5000');
});

const stdin = process.stdin;
stdin.setEncoding('utf-8');

let closingTimer;
let commitTimer;
let statisticsTimer;

stdin.on('data', (input) => {
    input = input.trim();

    // sd <N>
    if (input.startsWith('sd')) {
        const regex = /sd (\d+)/;
        const match = input.match(regex);
        if (match) {
            if (closingTimer) {
                console.log('Предыдущий таймер завершения был отменён');
                clearTimeout(closingTimer);
            }
            let timeInSeconds = parseInt(match[1], 10);
            console.log(`Приложение будет завершено через ${timeInSeconds} секунд`);
            closingTimer = setTimeout(() => {
                server.close(() => {
                    console.log('Сервер остановлен');
                    process.exit(0);
                });
            }, timeInSeconds * 1000);
        } else {
            console.log('Остановка сервера отменена');
            if (closingTimer) clearTimeout(closingTimer);
        }
    }

    // sc <N>
    if (input.startsWith('sc')) {
        const regex = /sc (\d+)/;
        const match = input.match(regex);
        if (match) {
            if (commitTimer) {
                console.log('Предыдущий таймер фиксации был отменён');
                clearInterval(commitTimer);
            }
            let timeInSeconds = parseInt(match[1], 10);
            console.log(`Каждые ${timeInSeconds} секунд будет проводиться фиксация`);
            commitTimer = setInterval(() => {
                db.emit('COMMIT');
            }, timeInSeconds * 1000);
            commitTimer.unref();
        } else {
            console.log('Периодическая фиксация остановлена');
            if (commitTimer) clearInterval(commitTimer);
        }
    }

    // ss <N>
    if (input.startsWith('ss')) {
        const regex = /ss (\d+)/;
        const match = input.match(regex);
        if (match) {
            if (statisticsTimer) {
                console.log('Предыдущий таймер статистики был отменён');
                clearTimeout(statisticsTimer);
                statistics.isActive = false;
                statistics.endTime = new Date().toISOString();
            }
            let timeInSeconds = parseInt(match[1], 10); //берёт первое значение и приводит к 10 системе
            console.log(`В течение ${timeInSeconds} секунд будет проводиться сбор статистики`);

            statistics.startTime = new Date().toISOString();
            statistics.endTime = null;
            statistics.requestCount = 0;
            statistics.commitCount = 0;
            statistics.isActive = true;

            statisticsTimer = setTimeout(() => {
                statistics.isActive = false;
                statistics.endTime = new Date().toISOString();
                statisticsTimer = null;
                console.log(`Сбор статистики завершен через ${timeInSeconds} секунд`);
                console.log('Результаты статистики:', JSON.stringify(statistics, null, 2));
            }, timeInSeconds * 1000);
            statisticsTimer.unref();
        } else {
            console.log('Сбор статистики остановлен');
            if (statisticsTimer) {
                clearTimeout(statisticsTimer);
                statistics.isActive = false;
                statistics.endTime = new Date().toISOString();
            }
        }
    }
});

stdin.unref();
