const { Telegraf, Types } = require('telegraf');
const { Composer } = require('micro-bot');
const axios = require('axios');
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
let sedangMencari;

// Development
// const bot = new Telegraf(BOT_TOKEN);

// Production
const bot = new Composer();

const sendDetail = (data, ctx) => {
  const messageId = ctx.update.message.message_id;
  const detail = `
Judul: <pre>${data.anilist.title.native}</pre>
Romaji: <pre>${data.anilist.title.romaji}</pre>
Inggris: <pre>${data.anilist.title.english}</pre>
Episode: <pre>${data.episode}</pre>
Timestamp: <pre>${new Date(data.from * 1000).toISOString().substr(11, 8)}</pre>
Kemiripan: <pre>${(data.similarity * 100).toFixed(2)}%</pre>
`;
  ctx.deleteMessage(sedangMencari);
  ctx.replyWithHTML(detail, { reply_to_message_id: messageId });
  ctx.replyWithVideo({ url: data.video });
  // console.log('Message ID:', messageId);
  // console.log(Extra);
  // ctx.reply(data, Extra.inReplyTo(messageId));
};

const getData = (image, ctx) => {
  const imageId = image[image.length - 1].file_id;
  axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${imageId}`)
  .then(res => {
    const imagePath = res.data.result.file_path;
    const imageURL = `https://api.telegram.org/file/bot${BOT_TOKEN}/${imagePath}`;
    axios.get(`https://api.trace.moe/search?anilistInfo&url=${encodeURIComponent(imageURL)}`)
    .then(res => {
      const data = res.data.result[0];
      sendDetail(data, ctx);
    })
    .catch(err => err);
  })
  .catch(err => err);
};

bot.start((ctx) => ctx.reply(`Halo ${ctx.from.first_name}, selamat datang di Anime Naon Ieu Bot, kirim screenshot dari scene anime yang ingin anda cari untuk menampilkan detail dari scene tersebut.`));

bot.command('help', (ctx) => ctx.reply(`Anda hanya perlu mengirimkan screenshot dari anime yang ingin dicari`));

bot.on('photo', async (ctx) => {
  const messageId = ctx.update.message.message_id;
  ctx.reply('Sedang mencari...', {reply_to_message_id : messageId})
  .then(m => {
    sedangMencari = m.message_id;
  });
  
  const image = ctx.update.message.photo;
  getData(image, ctx);
});

// Development
// bot.launch();

// Production
module.exports = bot;
