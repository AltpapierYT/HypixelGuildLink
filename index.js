const Discord = require('discord.js')
const mc = require('mineflayer')
const axios = require('axios')
const config = require('./config.json')
var Filter = require('bad-words')
filter = new Filter()
const client = new Discord.Client({ autoReconnect: true })
var ready = false

var newWords = ["abtreibung","anal","anus","arsch","arschficker","esel","arschloch","arschlöcher","balltasche","bälle","bastard","bellend","bestial","bestialität","hündin","hündinnen","schluchzen","blutig","blasen","bollok","boob","brüste","buceta","gammler","hintern","teppichmuncher","spalt","cipa","klitoris","schwanz","schwanzlutscher","schwänze","waschbär","mist","sperma","abspritzen","cunillingus","fotze","verdammt","dildo","dildos","dink","hundeficker","duche","deich","ejakulieren","ejakuliert","ejakulation","kippe","fagging","schwuchtel","schwuchteln","fanny","felching","fellatio","flansch","scheiße","gefickt","ficker","ficken","fickt","fudge packer","gott verdammt","gottverdammt","hölle","hore","geil","wichsen","kock","schamlippen","lust","lüstern","masochist","masturbieren","mutter ficker","nazi","nigger","orgasim","orgasmus","orgasmen","pecker","penis","piss","besoffen","pisser","pisst","pissen","pissoff","poop","porno","pornographie","stechen","stiche","pube","fotzen","muschi","vergewaltigen","vergewaltiger","rektum","verzögern","rimming","sadist","schrauben","hodensack","samen","sex","shag","shagging","transen","scheisse","geschissen","scheißen","beschissen","prostituierte","schlampe","schlampen","smegma","schmutz","schnappen","hurensohn","abstand","hoden","tit","titten","titt","turd","vagina","viagra","vulva","wang","hure","x bewertet","xxx"]
filter.addWords(...newWords);

var botstatusdiscordchannel
client.on('ready', () => {
    guildchatdiscordchannel = client.channels.cache.find(channel => channel.id === config.guildchatdiscordchannel)
    if (config.botstatusdiscordchannel !== '') botstatusdiscordchannel = client.channels.cache.find(channel => channel.id === config.botstatusdiscordchannel)
})

client.on('message', (message) => {
    if (message.channel.id === config.guildchatdiscordchannel) {
        if (message.author.bot) return
        if (message.content === '') return
        mcbot.chat(`/gchat ${message.author.username}: ${message.content}`)
        lastmessagesent = message
    }
})

const mcbot = mc.createBot({
    host: 'mc.hypixel.net',
    port: 25565,
    username: config.username,
    password: config.password,
    version: false,
    auth: 'mojang'
})

mcbot.on('login', async () => {
    mcbotname = mcbot._client.session.selectedProfile.name;
    setTimeout(async () => {
        mcbot.chat('/achat \u00a7ca')
        mcbot.chat('/gc Logged in')
        if (botstatusdiscordchannel !== undefined) await botstatusdiscordchannel.send('Logged in!')
    }, 5000)
    setTimeout(() => {
        ready = true
        return
    }, 6000)
})
var lastmessagesent
mcbot.on('message', async (msg) => {
    const mcmessage = msg.toString()
    if (config.chatlogs) console.log(mcmessage)
    if (!ready) return
    if (mcmessage.endsWith('sled into the lobby!') && mcmessage.startsWith('[MVP+')) {
        if (botstatusdiscordchannel !== undefined) await botstatusdiscordchannel.send('The Bot is reconnecting to Limbo...')
        mcbot.chat('/achat \u00a7ca')
        return;
    }
    if (config.confirmsendmessage) {
        if (mcmessage === 'You cannot say the same message twice!') {
            if (lastmessagesent !== undefined) {
                lastmessagesent.react('⛔')
            }
        }
    }
    if (mcmessage.startsWith('Guild') && mcmessage.includes(':')) {
        if (lastmessagesent !== undefined) {
            lastmessagesent.react('✅')
        }
        let splitmcmessage = mcmessage.split(' ')
        if (splitmcmessage[2].includes(mcbotname) || splitmcmessage[3].includes(mcbotname)) return
        let index = mcmessage.indexOf(':')
        splitmcmessage2 = [mcmessage.slice(0, index), mcmessage.slice(index + 1)]
        let author = (splitmcmessage[2].includes('[')) ? splitmcmessage[3].replace(':', '') : splitmcmessage[2].replace(':', '')
        var sentmessage = splitmcmessage2[1].substring(1)
        sentmessage = (config.badwordfilter) ? filter.clean(sentmessage) : sentmessage

        if (config.messagedesign === 0) {
            let uuid = (await axios.get(`https://api.mojang.com/users/profiles/minecraft/${author}`)).data.id
            let embed = new Discord.MessageEmbed()
                .setThumbnail(`https://visage.surgeplay.com/full/${uuid}`)
                .setAuthor(author)
                .setDescription(sentmessage)
                .setColor(config.embedcolor)
            guildchatdiscordchannel.send(embed)
        } else if (config.messagedesign === 1) {
            guildchatdiscordchannel.send(`**${author}**: ${sentmessage}`)
        } else if (config.messagedesign === 2) {
            let embed2 = new Discord.MessageEmbed()
                .setThumbnail(`https://mc-heads.net/avatar/${author}`)
                .setAuthor(author)
                .setDescription(sentmessage)
                .setColor(config.embedcolor)
            guildchatdiscordchannel.send(embed2)
        }


    }
})

mcbot.on('kicked', (reason) => {
    if (config.botstatusdiscordchannel !== '') {
        botstatusdiscordchannel.send(`The Minecraft bot got kicked from the server. Reason: ${reason}`)
    }
})

client.login(config.discordbottoken)
