#!/usr/bin/env node
/**
 * Module dependencies.
 */
var app = require('../app')
var debug = require('debug')('teamcontrol-reader:server')
var http = require('http')
var Terminal = require('../models/terminal')
var request = require('request')
var appHelper = require('../helpers/application_helper')
var theReaderClass = require('../models/reader/rfidReader')
var StatusInfo = require('../models/statusInfo')

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '8080')
app.set('port', port)
/**
 * Create HTTP server.
 */
var server = http.createServer(app)
/**
 * Listen on provided port, on all network interfaces.
 */
var io = require('socket.io').listen(server)
server.listen(port, '127.0.0.1')
server.on('error', onError)
server.on('listening', onListening)
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10)
  if (isNaN(port)) {
    // named pipe
    return val
  }
  if (port >= 0) {
    // port number
    return port
  }
  return false
}
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }
  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = server.address()
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
  debug('Listening on ' + bind)
}

pingEndpoint = '/api/v1/ping'
eventEndpoint = '/api/v1/event'
productionStartURL = 'https://r4h.teamcontrol.de'
devStartURL = 'http://10.99.99.104:3000'

if(app.get('env') === 'development'){
  pingEndpoint = devStartURL + pingEndpoint
  eventEndpoint = devStartURL + eventEndpoint
}else {
  pingEndpoint = productionStartURL + pingEndpoint
  eventEndpoint = productionStartURL + eventEndpoint  
}

var pingTimeout
var readerConnectTimeOut
var self = this
var lastConnectedClient


this.myTerminal = new Terminal()

/*
 * Ein neuer Client kommt und wird der aktuelle Client.
 * Socket.io erlaubt es nicht im Callback einen Broadcast an alle Clients zu schicken!
 * Deswegen gibt es aktuell nur einen Client. Das führt auch nicht zu Problemen da
 * das "Backend" des Terminals nur Intern erreichbar ist.
*/
io.on('connection', function (socket) {
  if(self.myTerminal != null) {
    lastConnectedClient = socket
    socket.emit('terminalContent', self.myTerminal.generate_connection_info())
  }
})

/*
 * Übergibt eine StatusInfo an den aktuellen Client.
 * Die StatusInfo wird 5 Sekunden angezeigt und danach durch den aktuellen Status des
 * Terminals ersetzt, nachdem dieses eine Abfrage an den Server gestartet hat.
 * Kommt in der Zwischenzeit eine "aktuellere" StatusInfo wird
 * diese angezeigt und der Timer zurück gesetzt.
*/
visualizeStatusInfo = function(statusInfo) {
  clearTimeout(self.pingTimeout)
  if(lastConnectedClient != undefined){
    lastConnectedClient.emit('terminalContent', statusInfo)  
  }
  self.pingTimeout = setTimeout(function(){
    authenticationRequest(self.myTerminal.getMacAddress())
  }, 5 * 1000)
}

/*
 * Es wird ein Request mit einem gelesenen Tag an den Endpoint 'event' des Backends gesendet.
 * Dazu wird die tagID benötigt. Die MAC-Adresse wird vom Terminal bezogen.
*/
sendTagRequest = function(tagID){

  request_options = {
    url: eventEndpoint,
    headers: {
      'X-Tc-Token': self.myTerminal.getMacAddress(),
      'Content-Type': 'application/json'
    },
    form: {
      id: tagID
    }
  }

  // Der Eigentliche Request
  request.post(request_options, function(error, httpResponse, body){
    content = new StatusInfo()

    if(error){
      // Fehler bei der Übertragung. Selbes verhalten wie bei "default"?
      self.myTerminal.connectionError(error)
      content = self.myTerminal.generate_connection_info()
    } else {
      switch(httpResponse.statusCode){
        case 200: // registrierter Tag aktzeptiert 
        case 201: // Tag wurde mit Fahrer verknüpft
        case 406: // tagID ist ungültig
        case 500: // tagID ist auch hier ungültig o.O?
        case 404: // Kein aktives Rennen
          content = httpResponse.body
          if(content['status']) {
          } else {
            content = JSON.parse(content)
          }
          break
        case 401: // Terminal nicht bekannt
          self.myTerminal.setAuthenticated(false)
          content = self.myTerminal.generate_connection_info()
          authenticationRequest(self.myTerminal.getMacAddress())
          break
        default: // Andere, nicht definierte, Antwort
          self.myTerminal.setConnected(false) // Das ist anders als case 401!!!
          content = self.myTerminal.generate_connection_info()
          authenticationRequest(self.myTerminal.getMacAddress())
      }
    }
    visualizeStatusInfo(content)
  })
}

/*
 * Der Server wird angepingt um zu
 * 1. prüfen ob der Server überhaupt erreichbar ist
 * 2. das Terminal beim Server bekannt ist
*/
authenticationRequest = function(macAsString) {

  request_options = {
    url: pingEndpoint,
    headers: {
      'X-Tc-Token': self.myTerminal.getMacAddress(),
      'Content-Type': 'application/json'
    }
  }

  request(request_options, function(error, httpResponse, body){
    if(!error && httpResponse.statusCode == 200){
      // Yeah die MAC-Adresse ist beim Server bekannt
      self.myTerminal.setAuthenticated(true)
      self.myTerminal.setConnected(true)
    } else if(!error && httpResponse.statusCode == 401) {
      // Die Mac-Adresse ist beim Server nicht bekannt
      self.myTerminal.setAuthenticated(false)
      self.myTerminal.setConnected(true)
    } else { 
      // Alles andere -> Fehler.
      self.myTerminal.setConnected(false)
    }
    visualizeStatusInfo(self.myTerminal.generate_connection_info())
  })
}

/*
 * Solange der Reader nicht Ready ist wird versucht ihn zu starten
*/
tryConnectTheReader = function(){
  if(self.readerConnectTimeOut != undefined) {
    clearInterval(self.readerConnectTimeOut)
  }
  if(self.myTerminal.getReaderRdy()) {
    visualizeStatusInfo(self.myTerminal.generate_connection_info())
  }else {
    self.theReader.open()
    self.readerConnectTimeOut = setInterval(tryConnectTheReader, 1000)
  }
}

// CallBack Reader
readerDataFunction = function(tagID){
  tagStatus = self.myTerminal.checkTagId(tagID)
  visualizeStatusInfo(tagStatus)
  if(tagStatus['status'] == 'info'){
    sendTagRequest(tagID)
  }
}

// CallBack Reader
readerCloseFunction = function(data){
  self.myTerminal.setReaderRdy(false)
  visualizeStatusInfo(self.myTerminal.generate_connection_info(data))
  tryConnectTheReader()
}

// CallBack Reader
readerRdyFunction = function(){
  self.myTerminal.setReaderRdy(true)
  clearInterval(self.readerConnectTimeOut)
  visualizeStatusInfo(self.myTerminal.generate_connection_info())
}


this.theReader = new theReaderClass(readerRdyFunction, readerDataFunction, readerCloseFunction)

// Wenn die MAC-Adresse des Terminals bekannt ist, kann mit den Request begonnen werden.
appHelper.getMac(function(error, mac){
  self.myTerminal.setMacAddress(mac)
  self.pingTimeout = setTimeout(function(){
    authenticationRequest(self.myTerminal.getMacAddress())
  }, 5 * 1000)
  self.readerConnectTimeOut = setInterval(tryConnectTheReader, 1000)
})
