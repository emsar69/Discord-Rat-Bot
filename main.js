require("dotenv").config()
const {Client, IntentsBitField} = require("discord.js")
const bot = new Client({intents: [IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.MessageContent, IntentsBitField.Flags.Guilds]})
const net = require("net")

var clients = {}
var guild

function checkNameAndType(name, type){
    return new Promise((res, rej) => {
        guild.channels.fetch().then(cs => {
            cs.forEach(c => {
                if(c.type == type && c.name == name) res(true);
            })
            res(false)
        })
    })
}

function setupCategory(name){
    guild.channels.create({type: 4, name: name}).then(ca => {
        guild.channels.create({name: "Cmd Remote"}).then(c => c.setParent(ca))
    })
}

async function createUser(name) {
    if(!guild) return;
    var has = await checkNameAndType(name, 4)
    if(!has) setupCategory(name)
}

const server = net.createServer(socket => {
    var user
    socket.write(JSON.stringify({type: "AuthRequest"}))

    socket.on("data", (msg) => {
        msg = msg.toString()
        try{
            const json = JSON.parse(msg)
            if(json){
                if(json["type"]){
                    if(json["type"] == "AuthRequest"){
                        user = json["uname"]+" "+json["cname"]
                        clients[user] = socket;
                        console.log(`${user} connected`)
                        setTimeout(() => {
                            createUser(user)
                        },5000)
                    }
                }
            }
        }catch(e){
            console.warn("Not Json.")
        }
    })

    socket.on("error", (err) => {
        if (user) delete clients[user]
    })

    socket.on("close", () => {
        if (user) delete clients[user]
    })

    socket.on("end", () => {
        if (user) delete clients[user]
    })
})

bot.on("messageCreate", (msg) => {
    if(msg.author.bot) return;
    if(msg.channel.name == "cmd-remote"){
        console.log(msg.channel.parent.name)
        var socket = clients[msg.channel.parent.name]
        if(!socket) return
        socket.write(JSON.stringify({type: "cmdRun", value: msg.content}))
    }
})

bot.on("ready", async() => {
    console.log(`Logged as ${bot.user.username}`)
    guild = await bot.guilds.fetch("1022544166078648360")
})

bot.login(process.env.discord_bot_token)

server.listen(80)