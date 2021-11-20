const { Telegraf, Markup } = require('telegraf');
const { Composer } = require('micro-bot');
const axios = require('axios');
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
let sedangMencari;
let bot;

// Atur mode'
switch (process.env.NODE_ENV) {
  case 'development':
    bot = new Telegraf(BOT_TOKEN);
    break;
  case 'production':
    bot = new Composer();
    break;
}

const sendDetail = (data, ctx) => {
  console.log(data);
  const messageId = ctx.update.message.message_id;
  const judulLain = data.anilist.synonyms
    .map((e) => {
      return `- \`${e}\``;
    })
    .join('\n');
  const detail = `*Native*: \`${data.anilist.title.native}\`
*Romaji*: \`${data.anilist.title.romaji}\`
*Inggris*: \`${data.anilist.title.english}\`
*Judul Lain*:
${judulLain}
*Episode*: \`${data.episode}\`
*Timestamp*: \`${new Date(data.from * 1000).toISOString().substr(11, 8)}\`
*Kemiripan*: \`${(data.similarity * 100).toFixed(1)}%\`
`;
  ctx.deleteMessage(sedangMencari);
  ctx.replyWithVideo({ url: data.video });
  ctx.replyWithMarkdown(detail, {
    reply_to_message_id: messageId,
    ...Markup.inlineKeyboard([
      [
        Markup.button.url('💵 Donasi', 'https://donate.tfkhdyt.my.id/'),
        Markup.button.url(
          '💻 Source Code',
          'https://github.com/tfkhdyt/anime-naon-ieu'
        ),
      ],
      [
        Markup.button.url(
          '💠 Project saya yang lainnya',
          'https://tfkhdyt.my.id/#portfolio'
        ),
      ],
    ]),
  });
};

const getData = (image, ctx) => {
  const imageId = image[image.length - 1].file_id;
  axios
    .get(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${imageId}`)
    .then((res) => {
      const imagePath = res.data.result.file_path;
      const imageURL = `https://api.telegram.org/file/bot${BOT_TOKEN}/${imagePath}`;
      axios
        .get(
          `https://api.trace.moe/search?anilistInfo&url=${encodeURIComponent(
            imageURL
          )}`
        )
        .then((res) => {
          const data = res.data.result[0];
          sendDetail(data, ctx);
        })
        .catch((err) => err);
    })
    .catch((err) => err);
};

bot.start((ctx) =>
  ctx.reply(
    `Halo ${ctx.from.first_name}, selamat datang di Anime Naon Ieu Bot, kirim screenshot dari scene anime yang ingin anda cari untuk menampilkan detail dari scene tersebut.`
  )
);

bot.command('help', (ctx) =>
  ctx.reply(
    `Anda hanya perlu mengirimkan screenshot dari anime yang ingin dicari`
  )
);

bot.on('photo', async (ctx) => {
  const messageId = ctx.update.message.message_id;
  ctx
    .reply('Sedang mencari...', { reply_to_message_id: messageId })
    .then((m) => {
      sedangMencari = m.message_id;
    });

  const image = ctx.update.message.photo;
  getData(image, ctx);
});

switch (process.env.NODE_ENV) {
  case 'development':
    bot.launch();
    break;
  case 'production':
    module.exports = bot;
    break;
}
