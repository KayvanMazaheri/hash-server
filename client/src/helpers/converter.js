import 'text-encoding/lib/encoding-indexes.js'
import { TextEncoder, TextDecoder } from 'text-encoding'

function arrayBufferToUtf8 (arrayBuffer) {
  return new TextDecoder('utf-8').decode(arrayBuffer)
}

function base64StringToArrayBuffer (base64) {
  console.log('base64StringToArrayBuffer started')
  console.log('base64 is ' + base64)
  console.log(typeof base64)
  base64 = base64.replace(/\s/g, '')
  var binaryString = atob(base64)
  console.log('a to b finished')
  var len = binaryString.length
  var bytes = new Uint8Array(len)
  for (var i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  console.log('base64StringToArrayBuffer finished')
  return bytes.buffer
}

function convertPemToBinary2 (pem) {
  var lines = pem.split('\n')
  var encoded = ''
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].trim().length > 0 &&
                lines[i].indexOf('-BEGIN RSA PRIVATE KEY-') < 0 &&
                lines[i].indexOf('-BEGIN RSA PUBLIC KEY-') < 0 &&
                lines[i].indexOf('-BEGIN PRIVATE KEY-') < 0 &&
                lines[i].indexOf('-BEGIN PUBLIC KEY-') < 0 &&
                lines[i].indexOf('-END PUBLIC KEY-') < 0 &&
                lines[i].indexOf('-END RSA PRIVATE KEY-') < 0 &&
                lines[i].indexOf('-END PRIVATE KEY-') < 0 &&
                lines[i].indexOf('-END RSA PUBLIC KEY-') < 0) {
      encoded += lines[i].trim()
    }
  }
  return encoded
}

function str2abUtf8 (myString) {
  return new TextEncoder('utf-8').encode(myString)
}

function arrayBufferToBase64String (arrayBuffer) {
  var byteArray = new Uint8Array(arrayBuffer)
  var byteString = ''
  for (var i = 0; i < byteArray.byteLength; i++) {
    byteString += String.fromCharCode(byteArray[i])
  }
  return btoa(byteString)
}

export default {
  arrayBufferToUtf8: arrayBufferToUtf8,
  base64StringToArrayBuffer: base64StringToArrayBuffer,
  convertPemToBinary2: convertPemToBinary2,
  str2abUtf8: str2abUtf8,
  arrayBufferToBase64String: arrayBufferToBase64String
}
