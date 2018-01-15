import converterWrapper from './converter'
// import bufferify from 'json-bufferify'

const crypto = window.crypto.subtle
const rsaParams = {name: 'RSA-OAEP', hash: {name: 'SHA-1'}}

function importPublicKey (keyInPemFormat) {
  return new Promise(function (resolve, reject) {
    var key = converterWrapper.convertPemToBinary2(keyInPemFormat)
    key = converterWrapper.base64StringToArrayBuffer(key)

    crypto.importKey('spki', key, rsaParams, false, ['encrypt'])
                .then(function (cryptokey) {
                  resolve(cryptokey)
                })
  })
}

function importPrivateKey (keyInPemFormat) {
  var key = converterWrapper.convertPemToBinary2(keyInPemFormat)
  key = converterWrapper.base64StringToArrayBuffer(key)

  return new Promise(function (resolve, reject) {
    crypto.importKey('pkcs8', key, rsaParams, false, ['decrypt'])
                .then(function (cryptokey) {
                  resolve(cryptokey)
                })
  })
}

function publicEncrypt (keyInPemFormat, message) {
  return new Promise(function (resolve, reject) {
    importPublicKey(keyInPemFormat).then(function (key) {
      crypto.encrypt(rsaParams, key, converterWrapper.str2abUtf8(message))
                    .then(function (encrypted) {
                      resolve(converterWrapper.arrayBufferToBase64String(encrypted))
                    })
    })
  })
}

function privateDecrypt (keyInPemFormat, encryptedBase64Message) {
  return new Promise(function (resolve, reject) {
    importPrivateKey(keyInPemFormat).then(function (key) {
      crypto.decrypt(rsaParams, key, converterWrapper.base64StringToArrayBuffer(encryptedBase64Message))
                    .then(function (decrypted) {
                      resolve(converterWrapper.arrayBufferToUtf8(decrypted))
                    })
    })
  })
}

// function sign (keyInPemFormat, message) {
//   importPrivateKey(keyInPemFormat).then(function (key) {
//     crypto.sign('RSASSA-PKCS1-v1_5', key, message)
//                   .then(function (signature) {
//                     resolve(converterWrapper.arrayBufferToUtf8(decrypted))
//                   })
//   })
// }
//
// function verify (keyInPemFormat, message, signature) {
//   return new Promise(function (resolve, reject) {
//     importPublicKey(keyInPemFormat).then(function (key) {
//       crypto.verify('RSASSA-PKCS1-v1_5', key, signature, message)
//                     .then(function (verified) {
//                       resolve(verified)
//                     })
//     })
//   })
// }

// function sign (keyInPemFormat, message) {
//   return new Promise(function (resolve, reject) {
//     importPrivateKey(keyInPemFormat).then(function (key) {
//       crypto.sign('RSASSA-PKCS1-v1_5', key, bufferify.encode(message))
//                     .then(function (signature) {
//                       resolve(signature)
//                     })
//     })
//   })
// }

function verify (keyInPemFormat, message, signature) {
  return new Promise(function (resolve, reject) {
    importPublicKey(keyInPemFormat).then(function (key) {
      crypto.verify('RSASSA-PKCS1-v1_5', key, converterWrapper.base64StringToArrayBuffer(signature), converterWrapper.base64StringToArrayBuffer(btoa(message)))
                    .then(function (verified) {
                      resolve(verified)
                    })
    })
  })
}

export default {
  importPrivateKey: importPrivateKey,
  importPublicKey: importPublicKey,
  privateDecrypt: privateDecrypt,
  publicEncrypt: publicEncrypt,
  // sign,
  verify
}
