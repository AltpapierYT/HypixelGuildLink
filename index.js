const Discord = require('discord.js')
const mc = require('mineflayer')
const axios = require('axios')
const config = require('./config.json')
const client = new Discord.Client({ autoReconnect: true })
var ready = false

var botstatusdiscordchannel
client.on('ready', () => {
    guildchatdiscordchannel = client.channels.cache.find(channel => channel.id === config.guildchatdiscordchannel)
    if(config.botstatusdiscordchannel !== '') botstatusdiscordchannel = client.channels.cache.find(channel => channel.id === config.botstatusdiscordchannel)
})

client.on('message', (message) => {
    if(message.channel.id === config.guildchatdiscordchannel) {
        if(message.author.bot) return
        if(message.content === '') return
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
    setTimeout(async ()=>{
        mcbot.chat('/achat \u00a7ca')
        mcbot.chat('/gc Logged in')
        if(botstatusdiscordchannel !== undefined) await botstatusdiscordchannel.send('Logged in!')
    }, 5000)
    setTimeout(()=>{
        ready = true
        return
    }, 6000)
}) 
var lastmessagesent
mcbot.on('message', async (msg) => {
    const mcmessage = msg.toString()
    if(config.chatlogs) console.log(mcmessage)
    if(!ready) return
    if(mcmessage.endsWith('sled into the lobby!') && mcmessage.startsWith('[MVP+')) {
        if(botstatusdiscordchannel !== undefined) await botstatusdiscordchannel.send('The Bot is reconnecting to Limbo...')
        mcbot.chat('/achat \u00a7ca')
        return;
    }
    if(config.confirmsendmessage) {
        if(mcmessage === 'You cannot say the same message twice!') {
            if(lastmessagesent !== undefined) {
                lastmessagesent.react('⛔')
            }
        }
    }
    if(mcmessage.startsWith('Guild') && mcmessage.includes(':')) {
        if(lastmessagesent !== undefined) {
            lastmessagesent.react('✅')
        }
        let splitmcmessage = mcmessage.split(' ')
        if(splitmcmessage[2].includes(mcbotname) || splitmcmessage[3].includes(mcbotname)) return
        let index = mcmessage.indexOf(':')
        splitmcmessage2 = [mcmessage.slice(0, index), mcmessage.slice(index + 1)]
        let author = (splitmcmessage[2].includes('[')) ? splitmcmessage[3].replace(':', '') : splitmcmessage[2].replace(':', '')
        let sentmessage = splitmcmessage2[1].substring(1)
        

        if(config.messagedesign === 0) {
            let uuid = (await axios.get(`https://api.mojang.com/users/profiles/minecraft/${author}`)).data.id
            let embed = new Discord.MessageEmbed()
            .setThumbnail(`https://visage.surgeplay.com/full/${uuid}`)
            .setTitle(author)
            .setDescription(sentmessage)
            .setColor(config.embedcolor)
            guildchatdiscordchannel.send(embed)
        } else if(config.messagedesign === 1) {
            guildchatdiscordchannel.send(`**${author}**: ${sentmessage}`)
        } else if(config.messagedesign === 2) {
            let embed2 = new Discord.MessageEmbed()
            .setThumbnail(`https://mc-heads.net/avatar/${author}`)
            .setTitle(author)
            .setDescription(sentmessage)
            .setColor(config.embedcolor)
            guildchatdiscordchannel.send(embed2)
        }
        

    }
})

mcbot.on('kicked', (reason) =>{
    if(config.botstatusdiscordchannel !== '') {
        botstatusdiscordchannel.send(`The Minecraft bot got kicked from the server. Reason: ${reason}`)
    }
})

client.login(config.discordbottoken)