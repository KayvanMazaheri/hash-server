const AES = require('../helpers/aes')
const RSA = require('../helpers/rsa')
const validator = require('../helpers/validator')
const crypto = require('crypto')

const Users = require('../models/User')

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

  // console.log(`shared AES key is ${JSON.stringify(socket.data.common.aesKey)} type: ${typeof socket.data.common.aesKey}`)

  socket.on('handshake', data => {
    // data = JSON.parse(data)
    socket.data.client.publicKey = data.publicKey
    console.log(`handshake from ${socket.id}. Public Key:\n ${socket.data.client.publicKey}`)

    let encryptedAESKey = RSA.encrypt(socket.data.client.publicKey, socket.data.common.aesKey.toString('base64'))
    let handshakeData = {
      server: { publicKey: socket.data.server.publicKey },
      nonce: socket.data.common.nonce,
    }
    let sign = RSA.sign(socket.data.server.privateKey, JSON.stringify(handshakeData))

    let handshakePackage = { data: handshakeData, sign }
    let encryptedHandshakePackage = AES.createAesMessage(socket.data.common.aesKey, JSON.stringify(handshakePackage))

    socket.emit('handshake', { encryptedAESKey, encryptedHandshakePackage })

    // Now client can either register or authenticate
    socket.on('register', data => {
      // data = JSON.parse(data)

      let decryptedData = JSON.parse(AES.decrypt(socket.data.common.aesKey, data))
      let request = decryptedData.data
      let signature = decryptedData.sign

      let integrity = true || RSA.verify(socket.data.client.publicKey, JSON.stringify(request), signature)
      console.log(`register request from ${socket.id}. integrity check ${(integrity ? 'pass' : 'fail')}ed`)

      if (false && !integrity) {
        // Disabled integrity check
        socket.emit('err', 'integrity check failed')
      } else if (!validator.registrationRequest(request)) {
        console.log(`register request from ${socket.id} failed: invalid request schema`)
        socket.emit('err', 'invalid request schema')
      } else {
        let newUser = {
          username: request.username,
          password: request.password,
          publicKey: socket.data.client.publicKey
        }
        Users.hashPassword(newUser, (err, user) => {
          if (err) {
            console.log(`register request from ${socket.id} failed: ${err}`)
            socket.emit('err', 'internal error happened')
          } else {
            Users.Users.insert(user, (err, savedUser) => {
              if (err) {
                console.log(`register request from ${socket.id} failed: ${err}`)
                socket.emit('err', `registration error happened`)
              } else {
                console.log(`register request from ${socket.id} succeeded: new user ${savedUser._id} saved`)
                // remove the password field from the user object
                delete savedUser.password

                let sign = RSA.sign(socket.data.server.privateKey, JSON.stringify(savedUser))
                let response = { data: savedUser, sign }

                let encryptedResponse = AES.createAesMessage(socket.data.common.aesKey, JSON.stringify(response))

                socket.emit('register', { encryptedResponse })
              }
            })
          }
        })
      }

    })
    socket.on('auth', data => {
      data = JSON.parse(data)

      let decryptedData = JSON.parse(AES.decrypt(socket.data.common.aesKey, data))
      let request = decryptedData.data
      let signature = decryptedData.sign

      let integrity = true || RSA.verify(socket.data.client.publicKey, JSON.stringify(request), signature)
      console.log(`authentication request from ${socket.id}. integrity check ${(integrity ? 'pass' : 'fail')}ed`)

      if (false && !integrity) {
        socket.emit('err', 'integrity check failed')
      } else if (!validator.authenticationRequest(request)) {
        console.log(`authentication request from ${socket.id} failed: invalid request schema`)
        socket.emit('err', 'invalid request schema')
      } else {
        Users.Users.findOne({ username: request.username, publicKey: socket.data.client.publicKey }, (err, user) => {
          if (err) {
            console.log(`authentication request from ${socket.id} failed: ${err}`)
            socket.emit('err', 'internal error happened')
          } else if (!user) {
            console.log(`authentication request from ${socket.id} failed: no such user ${request.username} with specified public key`)
            socket.emit('err', `no such user ${request.username} with specified public key`)
          } else {
            Users.comparePassword(user, request.password, (err, isMatch) => {
              if (err) {
                console.log(`authentication request from ${socket.id} failed: ${err}`)
                socket.emit('err', 'internal error happened')
              } else {
                let sign = RSA.sign(socket.data.server.privateKey, JSON.stringify(isMatch))
                let response = { data: isMatch, sign }

                let encryptedResponse = AES.createAesMessage(socket.data.common.aesKey, JSON.stringify(response))

                socket.emit('auth', { encryptedResponse })

                if (isMatch) {
                  // Authenticated !
                  socket.off('auth')
                  socket.off('registration')

                  socket.on('hash', data => {

                  })
                }
              }
            })
          }
        })
      }
    })
  })
  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`)
  })
}
