//7. Разработайте модуль m0603, 
// который экспортирует одну функцию send.  
//8. Функция send принимает один параметр – строку.
//9. Результатом выполнения функции send, 
// является почтовое сообщение (email), содержащее строку, 
// принятую в качестве параметра.  Отправка сообщения, 
// осуществляется с помощью модуля sendmail.

const {send} = require('./module/m0603');

async function testNM() {
    try {
        const info = await send("text");
        console.log('Message has been sent');
    } catch (err) {
        console.log(err);
    }
}
//node .\06-03.js "aink zxgx xisn ehgz"   
testNM();