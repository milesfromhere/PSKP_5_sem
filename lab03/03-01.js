const http = require('http');
const readline = require('readline');

let currentState = 'norm';

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
        <html>
            <head>
                <title>Состояние приложения</title>
                <meta charset="utf-8">
            </head>
            <body>
                <h1>Текущее состояние: ${currentState}</h1>
            </body>
        </html>
    `);
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function prompt() {
    rl.setPrompt(`${currentState}-> `);
    rl.prompt();
}

console.log('Сервер запущен на http://localhost:5000');
console.log('Доступные состояния: norm, stop, test, idle, exit');

prompt();

rl.on('line', (input) => {
    const state = input.trim().toLowerCase();
    
    if (state === 'exit') {
        console.log('Завершение работы приложения...');
        server.close();
        rl.close();
        process.exit(0);
    }
    
    if (['norm', 'stop', 'test', 'idle'].includes(state)) {
        currentState = state;
        console.log(`Состояние изменено на: ${currentState}`);
    } else {
        console.log(`Ошибка: "${input}" не является допустимым состоянием`);
    }
    
    prompt();
});

server.listen(5000, () => {
    console.log('Сервер запущен на порту 5000');
});