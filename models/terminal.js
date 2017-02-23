var StatusInfo = require('./statusinfo')
/*
  Prio Order für Messages:
    1. Internet?
    2. Am Server registriert?
    3. Reader bereit zum lesen?

    TODO:
      MAC-setzen
*/
function Terminal(){
  var macAddress = ''
  var splittedMacAddress = ''
  var isConnected = false
  var isAuthenticated = false
  var isReaderReady = false
  var lastScanTimePerID = new Object()
  var authenticationTimer

  this.generate_connection_info = function(additionalInfo){
    var info

    if(this.isConnected) {
      if(this.isAuthenticated) {
        if(this.isReaderReady) {
          info = new StatusInfo('', 'info', 'Bereit')
        } else {
          info = new StatusInfo('','wait','Warte auf Reader')
        }
      } else {
        info = new StatusInfo('Station in TeamControl registrieren', 'wait', splittedMacAddress)
      }
    } else {
      info = new StatusInfo('Verbindung mit dem Server fehlgeschlagen', 'wait', 'Bitte Verbindung überprüfen')
    }
    info.additional = additionalInfo
    return info
  }

  this.getMacAddress = function() {
    return macAddress
  }

  this.setConnected = function(newIsConnected) {
    this.isConnected = newIsConnected
    if(!this.isConnected){
      this.isAuthenticated = false
    }
  }
  this.setAuthenticated = function(newIsAuthenticated) {
    this.isAuthenticated = newIsAuthenticated
  }

  this.setReaderRdy = function(newIsReaderRdy) {
    this.isReaderReady = newIsReaderRdy
  }

  this.getReaderRdy = function() {
    return isReaderReady
  }

  this.setMacAddress = function(macAsString) {
    macAddress = macAsString
    if(!macAddress || macAddress.length == 0){
      splittedMacAddress = macAddress
    } else {
      splittedMacAddress = macAddress.split(/(..)/).filter(function(val){ return val.length > 0 }).join(' ')
    }
  }

  this.getSplittedMacAddress = function(){
    return this.splittedMacAddress
  }

  this.checkTagId = function(tagId){
    if(this.isConnected && this.isAuthenticated){
      // data ist ein String. Wie er aussieht ist mit egal
      // Was muss ich tun?
      // Überprüfen wann/ob der String das letzte mal gesendet wurde.
      lastscanTime = lastScanTimePerID[tagId]

      if(lastscanTime != null){
        difference = new Date(Date.now() - lastscanTime)
        if(difference.getSeconds() <= 5){
          return new StatusInfo('Zu häufig gescannt - Bitte 5 Sekunden warten', 'error', 'Bitte warten')
        }
      }
      
      lastScanTimePerID[tagId] = Date.now()
      // Der Tag kann gesendet werden
      return new StatusInfo('Daten werden übermittelt', 'info', 'Bitte warten')
    }
    return this.generate_connection_info()
  }
}

module.exports = Terminal
