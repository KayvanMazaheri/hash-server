const info = require('./package.json')
const express = require('express')
const dotenv = require('dotenv')
const socketio = require('socket.io')
const http = require('http')
const path = require('path')

const { socketController } = require('./controllers')

// Load Environment Variables
dotenv.load()

// Create Express app, Socket.io instance and HTTP server and bind them together
const app = express()
const httpServer = http.Server(app)
const io = socketio(httpServer)

app.use('/static', express.static(path.join(__dirname, '/dist/static')))
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/dist/index.html'));
})

// Load the socket.io controllers
io.on('connection', socketController)

// Set port number for app
app.set('port', process.env.PORT || 3000)

// Listen for connections
httpServer.listen(app.get('port'), function () {
  console.log(`${info.name} is listening on port ${app.get('port')}`)
  console.log(`(version ${info.version})`)
})

module.exports = httpServer
