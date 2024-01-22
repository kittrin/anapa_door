const {axios} =require('axios');
const {json, send} = require('micro');
const {includes, lowerCase} = require('lodash');
const http = require('http');

// const hostname = '178.155.14.28';
// const port = 3000;
//
// const server = http.createServer((req, res) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     res.end('Hello World!\n');
// });
//
// server.listen(port, hostname, () => {
//     console.log(`Server running at http://${hostname}:${port}/`);
// });

class OpenDoorController{
    static async getOpen(){
        return await axios({
            method: 'get',
            url: `http://admin:admin@10.10.1.224/protect/rb0s.cgi`,
            // headers: {
            //     'Authorization': 'admin:admin'
            // }
        }).then((response) => {
            return response.data
        })
    }
}
const data = async ()=>{
    try {
         await OpenDoorController.getOpen()
    } catch (e){
        console.log(e)
    } finally {

    }
}
// await data();
// console.log(data())

module.exports = async (req, res) => {
    // Код для HTTP-ответа:
    let statusCode = 200;

    // Принимаем только POST-запросы:
    if (req.method !== "POST") {
        statusCode = 400;
        await send(res, statusCode, 'Bad Request');
        return;
    }

    // API Яндекс.Диалоги:
    const {meta, request, session, version} = await json(req);

    // Текущая сессия не закрыта:
    let isEndSession = false;

    // Получаем фразу юзера или надпись с кнопки которую он нажал (и переводим в нижний регистр):
    const userUtterance = lowerCase(request.original_utterance);
    console.log(userUtterance)
    // Сообщение юзеру (на всякий случай знак пробела, чтобы застраховаться от ошибки в Яндекс.Диалоги, если соощение окажется пустой строкой):
    let message = ' ';

    // Быстрый ответ (чтобы не делать лишние запросы к стороннему API) на проверочный пинг от Яндекса:
    if (userUtterance === 'ping') {
        message = 'ОК';
        isEndSession = true;
        await send(res, statusCode, {
            version,
            session,
            response: {
                text: message,
                end_session: isEndSession
            }
        });
        return;
    }

    // Получаем массив всех слов из последней фразы юзера:
    let userWords = [];

    if (request.nlu.tokens.length > 0) {
        const tokensArr = request.nlu.tokens;
        for (let i = 0; i < tokensArr.length; i++) {
            userWords.push(tokensArr[i]);
        }
    }
    // Формируем перманентный вопрос к юзеру:
    const prompt = `сейчас сделаю`;

    // Теперь стараемся понять юзера. Эту логику также лучше писать в отдельном файле,
    // поскольку может быть много кода, но в данном весьма упрощённом примере -- пишем здесь.
    // Будем использовать функции includes() из библиотеки Lodash, которая ищет подстроку.

    // Намерения юзера:
    let intent;

    const playWords = ['открой шлагбаум'];

    for (let item of playWords) {
        if (includes(userUtterance, item)) {
            intent = 'play';
            break;
        }
    }


    // И вот он -- диалог с юзером!:
    if (!userUtterance) {
        if (intent === 'play') {
            // Определение функции setData() -- в конце кода:
            message = await setData();
        }
    }


    // Ответ Алисе:
    await send(res, statusCode, {
        version,
        session,
        response: {
            text: message,
            end_session: isEndSession
        }
    });


    // Функция, которая получает данные и возвращает отформатированную цитату:
    async function setData() {
        let quote;
        let author;
        try {
            // Получение "сырых" данных:
            const data = 'окей уважаемый'
        } catch (err) {
            quote = 'Мысль потеряна! Попробуйте ещё раз.';
            console.error('Fail to fetch data: ' + err);
        }
        // Отформатированная цитата:
        return `${quote}\n${author ? '— ' : ''}${author}\n${prompt}`;
    }
};
