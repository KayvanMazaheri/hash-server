const info = require('./package.json')
const express = require('express')
const q = require('q')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const socketio = require('socket.io')
const http = require('http')

// Load Environment Variables
dotenv.load()

// Create Express app, Socket.io instance and HTTP server and bind them together
const app = express()
const httpServer = http.Server(app)
const io = socketio(httpServer)

// Set port number for app
app.set('port', process.env.PORT || 3000)

// plug q as mongoose primary promise
mongoose.Promise = q.Promise

// connect to db, must make sure connection is established
mongoose.connect(process.env.MONGO_URI, { useMongoClient: true })
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${process.env.MONGO_URI}`)
})

// Listen for connections
httpServer.listen(app.get('port'), function () {
  console.log(`${info.name} is listening on port ${app.get('port')}`)
  console.log(`(version ${info.version})`)
})

module.exports = httpServer
