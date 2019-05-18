const SlackBot = require('slackbots') 
const Brain = require('./brain')

require('dotenv').config()

const BOT_TOKEN = process.env.BOT_TOKEN

const bot = new SlackBot({
    json_file_store: './db_slackbutton_slash_command/',
    token: BOT_TOKEN,
    name: 'Ro.bot'
})

const robot = new Brain()

bot.on('start', () => {
    bot.postMessageToChannel('general', robot.enableGeneration(), {icon_emoji: ':robot_face:'})
})

bot.on("message", msg => {
  switch (msg.type) {
  case "message":
    if (msg.channel[0] === "D" && msg.bot_id === undefined) {
        robot.sendChat(msg.text)
        .then(answer => {
            bot.postMessage(msg.user, answer, { as_user: true })
        })
    }
    break
  }
})
