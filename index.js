const{Telegraf:Telegraf,Markup:Markup}=require("telegraf"),{Composer:Composer}=require("micro-bot"),axios=require("axios");require("dotenv").config();const BOT_TOKEN=process.env.BOT_TOKEN;let sedangMencari,bot;switch(process.env.NODE_ENV){case"development":bot=new Telegraf(BOT_TOKEN);break;case"production":bot=new Composer}const sendDetail=(e,t)=>{console.log(e);const a=t.update.message.message_id,n=e.anilist.synonyms.map((e=>`- \`${e}\``)).join("\n"),i=`*Native*: \`${e.anilist.title.native}\`\n*Romaji*: \`${e.anilist.title.romaji}\`\n*Inggris*: \`${e.anilist.title.english}\`\n*Judul Lain*:\n${n}\n*Episode*: \`${e.episode}\`\n*Timestamp*: \`${new Date(1e3*e.from).toISOString().substr(11,8)}\`\n*Kemiripan*: \`${(100*e.similarity).toFixed(1)}%\`\n`;t.deleteMessage(sedangMencari),t.replyWithVideo({url:e.video}),t.replyWithMarkdown(i,{reply_to_message_id:a,...Markup.inlineKeyboard([[Markup.button.url("💵 Donasi","https://donate.tfkhdyt.my.id/"),Markup.button.url("💻 Source Code","https://github.com/tfkhdyt/anime-naon-ieu")],[Markup.button.url("💠 Project saya yang lainnya","https://tfkhdyt.my.id/#portfolio")]])})},getData=(e,t)=>{const a=e[e.length-1].file_id;axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${a}`).then((e=>{const a=e.data.result.file_path,n=`https://api.telegram.org/file/bot${BOT_TOKEN}/${a}`;axios.get(`https://api.trace.moe/search?anilistInfo&url=${encodeURIComponent(n)}`).then((e=>{const a=e.data.result[0];sendDetail(a,t)})).catch((e=>e))})).catch((e=>e))};switch(bot.start((e=>e.reply(`Halo ${e.from.first_name}, selamat datang di Anime Naon Ieu Bot, kirim screenshot dari scene anime yang ingin anda cari untuk menampilkan detail dari scene tersebut.`))),bot.command("help",(e=>e.reply("Anda hanya perlu mengirimkan screenshot dari anime yang ingin dicari"))),bot.on("photo",(async e=>{const t=e.update.message.message_id;e.reply("Sedang mencari...",{reply_to_message_id:t}).then((e=>{sedangMencari=e.message_id}));const a=e.update.message.photo;getData(a,e)})),process.env.NODE_ENV){case"development":bot.launch();break;case"production":module.exports=bot}
