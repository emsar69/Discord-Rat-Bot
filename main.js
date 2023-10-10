require("dotenv").config()
const {Client, IntentsBitField} = require("discord.js")
const bot = new Client({intents: [IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.MessageContent]})
const net = require("net")

var clients = {}

const server = net.createServer(socket => {
    var user
    socket.write(JSON.stringify({type: "AuthRequest"}))

    socket.on("data", (msg) => {
        msg = msg.toString()
        const json = JSON.parse(msg)
        if(json){
            if(json["type"]){
                if(json["type"] == "AuthRequest"){
                    user = json["uname"]+" "+json["cname"]
                    clients[user] = socket;
                    console.log(`${user} connected`)
                }
            }
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

bot.on("ready", () => {
    console.log(`Logged as ${bot.user.username}`)
})

bot.login(process.env.discord_bot_token)

server.listen(80)