const AES = require('../helpers/aes')
const RSA = require('../helpers/rsa')
const crypto = require('crypto')

module.exports = function socketController (socket) {
  console.log(`${socket.id} connected`)

  // Add "data" proprty to the socket to store clients' data
  socket.data = {}

  socket.data.client = {}
  // Generates new RSA key pair per socket connection
  socket.data.server = RSA.generateKey()
  // Generates new AES key per socket connection
  socket.data.common = {
    aesKey: AES.generateKey(),
    nonce: crypto.randomBytes(32)
  }

  socket.on('handshake', data => {
    data = JSON.parse(data)
    socket.data.client.publicKey = data.publicKey
    console.log(`handshake from ${socket.id}: PK is ${socket.data.client.publicKey}`)

    let encryptedAESKey = RSA.encrypt(socket.data.client.publicKey, socket.data.common.aesKey)
    let handshakeData = {
      server: { publicKey: socket.data.server.publicKey },
      nonce: socket.data.common.nonce,
    }
    let sign = RSA.sign(socket.data.server.privateKey, JSON.stringify(handshakeData))

    let handshakePackage = { handshakeData, sign }
    let encryptedHandshakePackage = AES.createAesMessage(socket.data.common.aesKey, JSON.stringify(handshakePackage))

    socket.emit('handshake', { encryptedAESKey, encryptedHandshakePackage })

    // Now client can either register or authenticate
    socket.on('register', data => {})
    socket.on('auth', data => {})
  })
  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`)
  })
}
