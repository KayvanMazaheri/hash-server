const bcrypt = require('bcrypt')

const Datastore = require('nedb')

let dbPath = process.env.DB_PATH || 'database.db'

const hashPassword = (user, cb) => {
  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      cb(err)
    }
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) {
        cb(err)
      }
      user.password = hash
      cb(null, user)
    })
  })
}

const comparePassword = (user, password, cb) => {
  bcrypt.compare(password, user.password, function (err, isMatch) {
    cb(err, isMatch)
  })
}

let Users = new Datastore({ filename: dbPath, autoload: true })

Users.ensureIndex({ fieldName: 'username', unique: true })

module.exports = {
  Users,
  hashPassword,
  comparePassword
}
