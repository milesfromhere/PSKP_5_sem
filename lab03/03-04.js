const http = require('http'); /// итерация эвент лупа
const url = require('url');

function factorialAsync(k, callback) {
    if (k < 0) {
        process.nextTick(() => callback(0));
        return;
    }
    if (k === 0 || k === 1) {
        process.nextTick(() => callback(1));
        return;
    }
    
    let result = 1;
    let current = 1;
    
    function computeNext() {
        if (current > k) {
            process.nextTick(() => callback(result));
            return;
        }
        
        result *= current;
        current++;
        
        if (current % 100 === 0) {
            setImmediate(computeNext);
        } else {
            process.nextTick(computeNext);
        }
    }
    
    process.nextTick(computeNext);
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
        
        factorialAsync(k, (fact) => {
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ k: k, fact: fact }));
        });
    } else if (parsedUrl.pathname === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Вычисление факториалов (async)</title>
                <meta charset="utf-8">
            </head>
            <body>
                <h1>Вычисление факториалов от 1 до 20 (async)</h1>
                <div id="results"></div>
                <div id="timer">Общее время: <span id="totalTime">0</span> мс</div>
                
                <script>
                    const startTime = Date.now();
                    const resultsDiv = document.getElementById('results');
                    const totalTimeSpan = document.getElementById('totalTime');
                    let completedRequests = 0;
                    const totalRequests = 20;
                    
                    async function fetchFactorials() {
                        for (let x = 1; x <= totalRequests; x++) {
                            try {
                                const requestTime = Date.now();
                                const response = await fetch('http://localhost:5000/fact?k=' + x);
                                const data = await response.json();
                                const endTime = Date.now();
                                const elapsed = endTime - startTime;
                                
                                const resultDiv = document.createElement('div');
                                resultDiv.textContent = elapsed + '-' + data.k + '/' + data.fact;
                                resultsDiv.appendChild(resultDiv);
                            } catch (error) {
                                console.error('Ошибка:', error);
                            }
                            
                            completedRequests++;
                            if (completedRequests === totalRequests) {
                                const totalElapsed = Date.now() - startTime;
                                totalTimeSpan.textContent = totalElapsed;
                            }
                        }
                    }
                    
                    fetchFactorials();
                </script>
            </body>
            </html>
        `);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(5000, () => {
    console.log('Сервер запущен на http://localhost:5000');
});