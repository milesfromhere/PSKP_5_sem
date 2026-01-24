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