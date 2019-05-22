require('dotenv').config()
const SlackBot = require('slackbots') 
const Brain = require('./brain')
const express = require('express')
const path = require('path')

const PORT = process.env.PORT || 5000
const BOT_TOKEN = process.env.BOT_TOKEN

express()
  .use(express.static(path.join(__dirname, 'public')))
  .get('/', (req, res) => res.json({ success: true }))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))


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
