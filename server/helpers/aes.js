const crypto = require('crypto')

const generateKey = (len = 32) => crypto.randomBytes(len)

const generateIv = (len = 16) => crypto.randomBytes(len)

// separate initialization vector from message
const separateVectorFromData = (data) => {
  var iv = data.slice(-24)
  var message = data.substring(0, data.length - 24)

  return {
    iv,
    message
  }
}

const encrypt = (key, iv, text) => {
  let encrypted = ''
  let cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  encrypted += cipher.update(Buffer.from(text), 'utf8', 'base64')
  encrypted += cipher.final('base64')

  return encrypted
}

const decrypt = (key, text) => {
  let dec = ''
  let data = separateVectorFromData(text)
  let cipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(data.iv, 'base64'))
  dec += cipher.update(Buffer.from(data.message, 'base64'), 'base64', 'utf8')
  dec += cipher.final('utf8')

  return dec
}

// add initialization vector to message
const addIvToBody = (iv, encryptedBase64) => encryptedBase64 + iv.toString('base64')

const createAesMessage = (aesKey, message) => {
  let aesIv = generateIv()
  let encryptedMessage = encrypt(aesKey, aesIv, message)
  encryptedMessage = addIvToBody(aesIv, encryptedMessage)

  return encryptedMessage
}

module.exports = {
  generateKey,
  generateIv,
  separateVectorFromData,
  encrypt,
  decrypt,
  addIvToBody,
  createAesMessage
}
