const SlackBot = require('slackbots')
require('dotenv').config()
const dataset = require('./conversation.json')

const BOT_TOKEN = process.env.BOT_TOKEN

const bot = new SlackBot({
    json_file_store: './db_slackbutton_slash_command/',
    token: BOT_TOKEN,
    name: 'Ro.bot'
})

bot.on('start', () => {
    bot.postMessageToChannel('general', 'I`m aliveee')
})

bot.on("message", msg => {
  switch (msg.type) {
  case "message":
    if (msg.channel[0] === "D" && msg.bot_id === undefined) {
        bot.postMessage(msg.user, bestAnswer(msg.text), { as_user: true })
    }
    break
  }
})

const bestAnswer = (message) => {
    const words = message.split(' ').map(word => word.toLowerCase())
    let highestMatches = 0
    let matches = 0
    let closestMessage = ''

    const closestConversation = dataset.conversations.filter((conversation, id) => {
        const formatedConversation = conversation.map(phrase => phrase.toLowerCase())
        formatedConversation.map((phrase, i) => {
            const phraseWords = phrase.split(' ')
            words.forEach( word => {
                if(phraseWords.includes(word)){
                    matches++
                }
            })
            if(matches > highestMatches) {
                highestMatches = matches
                closestMessage = phrase
            }
            matches = 0
        })

        return formatedConversation.includes(closestMessage)
    })

    const answer = closestConversation[0][closestConversation[0].indexOf(closestMessage) + 1]
    if(!answer) {
        return 'I never took so far in a conversation... idk what to answer'
    }
    return answer
}
