const tf = require('@tensorflow/tfjs')
const tfn = require('@tensorflow/tfjs-node')

const token = require('./token')
const inputWord = require('./mappings/input-word2idx')
const wordContext = require('./mappings/word-context')
const targetWord = require('./mappings/target-word2idx')
const targetId = require('./mappings/target-idx2word')

const decoderModel = tfn.io.fileSystem('./decoder-model/model.json')
const encoderModel = tfn.io.fileSystem('./encoder-model/model.json')

module.exports = class Brain {

    constructor() {
        Promise.all([
            tf.loadLayersModel(decoderModel),
            tf.loadLayersModel(encoderModel)
        ]).then(([decoder, encoder]) => {
            this.decoder = decoder
            this.encoder = encoder
            this.enableGeneration()
        })
    }
  
    enableGeneration() {
        return 'I`m aliveeeeee!!!'
    }
  
    async sendChat(inputText) {
        const states = tf.tidy(() => {
            const input = this.convertSentenceToTensor(inputText)
            console.log('enconder!!!!!', this.encoder )
            return this.encoder.predict(input)
        })
        
        this.decoder.layers[1].resetStates(states)
    
        let responseTokens = []
        let terminate = false
        let nextTokenID = targetWord['<SOS>']
        let numPredicted = 0
        while (!terminate) {
            const outputTokenTensor = tf.tidy(() => {
                const input = this.generateDecoderInputFromTokenID(nextTokenID)
                const prediction = this.decoder.predict(input)
                return this.sample(prediction.squeeze())
            })
    
            const outputToken = await outputTokenTensor.data()
            outputTokenTensor.dispose()
            nextTokenID = Math.round(outputToken[0])
            const word = targetId[nextTokenID]
            numPredicted++
            console.log(outputToken, nextTokenID, word)
    
            if (word !== '<EOS>' && word !== '<SOS>') {
                responseTokens.push(word)
            }
    
            if (word === '<EOS>'
                || numPredicted >= wordContext.decoder_max_seq_length) {
                terminate = true
            }
    
            await tf.nextFrame()
        }
    
        const answer = this.convertTokensToSentence(responseTokens)

        states[0].dispose()
        states[1].dispose()
    
        return await answer
    }
  
    generateDecoderInputFromTokenID(tokenID) {
        const buffer = tf.buffer([1, 1, wordContext.num_decoder_tokens])
        buffer.set(1, 0, 0, tokenID)
        return buffer.toTensor()
    }
  
  
    sample(prediction) {
        return tf.tidy(() => prediction.argMax())
    }
  
    convertSentenceToTensor(sentence) {
        let inputWordIds = []
        token.tokenizer(sentence).map((x) => {
            x = x.toLowerCase()
            let idx = '1'
            if (x in inputWord) {
                idx = inputWord[x]
            }
            inputWordIds.push(Number(idx))
        })
        if (inputWordIds.length < wordContext.encoder_max_seq_length) {
            let sequence = new Array(wordContext.encoder_max_seq_length-inputWordIds.length+1)
                .join('0').split('').map(Number)
            inputWordIds = [...sequence, ...inputWordIds]
  
        } else {
            inputWordIds = inputWordIds.slice(0, wordContext.encoder_max_seq_length)
        }

        return tf.tensor2d(inputWordIds, [1, wordContext.encoder_max_seq_length])
    }
  
    convertTokensToSentence(tokens) {
        return tokens.join(' ')
    }
  
}
