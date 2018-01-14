const NodeRSA = require('node-rsa')
const crypto = require('crypto')

const generateKey = () => {
  let key = new NodeRSA()
  key.generateKeyPair(2048, 65537)

  return {
    publicKey: key.exportKey('pkcs8-public-pem'),
    privateKey: key.exportKey('pkcs8-private-pem')
  }
}

const encrypt = (publicKey, message) => {
  let enc = crypto.publicEncrypt({
    key: publicKey,
    padding: crypto.RSA_PKCS1_OAEP_PADDING
  }, Buffer.from(message))
  return enc.toString('base64')
}

const decrypt = (privateKey, message) => {
  let enc = crypto.privateDecrypt({
    key: privateKey,
    padding: crypto.RSA_PKCS1_OAEP_PADDING
  }, Buffer.from(message, 'base64'))
  return enc.toString()
}

const sign = (privateKey, message) => {
  let s = crypto.createSign('SHA256')
  s.update(Buffer.from(message), 'utf8')
  return s.sign(privateKey, 'base64')
}

const verify = (publicKey, message, signature) => {
  let v = crypto.createVerify('SHA256')
  v.update(message, 'utf8')
  return v.verify(publicKey, signature, 'base64')
}

module.exports = {
  generateKey,
  encrypt,
  decrypt,
  sign,
  verify
}
