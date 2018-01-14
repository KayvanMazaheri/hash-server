const crypto = require('crypto')

const sha256 = message => {
  let hash = crypto.createHash('sha256')
  hash.update(Buffer.from(message))

  return hash.digest('base64')
}

module.exports = {
  sha256
}
