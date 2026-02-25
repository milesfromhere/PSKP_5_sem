//4. Разработайте приложение 06-02, использующее пакет sendmail.   
//5. Приложение 06-02, должно оправлять на браузер HTML-страницу, 
// позволяющую ввести почтовые ящики отправителя и получателя, 
// а также пересылаемое сообщение.

const nodemailer = require('nodemailer');
const http = require('http');
const fs = require('fs');
const url = require('url');
const {parse} = require('querystring'); 

const port = 5000;

const EMAIL = "nikitabondarik@gmail.com";
const PASS = "aink zxgx xisn ehgz";

const nm = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL,
        pass: PASS   
    },
});

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if(req.method === 'GET' && parsedUrl.pathname === '/') {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        fs.createReadStream('./index.html').pipe(res);
    }
    else if(req.method === 'POST' && parsedUrl.pathname === '/') {
        let body = '';
        req.on('data', chunk => {body += chunk;});
        req.on('end', () => {
            let params = parse(body);

            const email = {
                from: params.from || EMAIL,
                to: params.to || EMAIL,
                subject: params.subject || "без темы",
                html: `<div>${params.message || "нет текста"}</div>`,
            };
            
            nm.sendMail(email)
                .then(info => {
                    console.log("Письмо отправлено успешно:", info.response, "\n===========================\n");
                    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                    res.end(`<h2>Письмо успешно отправлено!</h2>
                            <p>От: ${email.from}</p>
                            <p>Кому: ${email.to}</p>
                            <p>Тема: ${email.subject}</p>
                            <p><a href="/">Отправить еще одно письмо</a></p>`);
                })
                .catch(err => {
                    console.error('Ошибка отправки:', err);
                    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                    res.end(`<h2>Ошибка при отправке:</h2>
                            <p>${err.message}</p>
                            <p><a href="/">Попробовать снова</a></p>`);
                });
        });
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h2>Страница не найдена</h2><p><a href="/">Вернуться на главную</a></p>');
    }
});

server.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Используется почта отправителя: ${EMAIL}`);
});