var SerialPort = require('serialport')

// Reader Product ID 0x2303
// Reader Vendor ID 0x067b

function RFIDReader(rdyCallback, dataCallback, closeCallback){
  var creatorReadyCallback = rdyCallback
  var creatorDataCallback = dataCallback
  var creatorCloseCallback = closeCallback

  var vendorID = '0x067b'
  var productID = '0x2303'
  var readerComPort
  var readerPort
  var dataBuffer = Buffer.alloc(20)
  var bufferNextPos = 0
  var tagIDStartPos = -1
  var tagIDEndPos = -1



  sendErrorsound = function(){
    // A = 0x41
    readerPort.write(new Buffer('A'))
  }

  sendSuccessSound = function(){
    // B = 0x42
    readerPort.write(new Buffer('B'))
  }

  var tryConnect = function(error, ports) {
    if(readerPort == undefined){
      ports.forEach(function(port){
        if(port.vendorId != undefined && port.productId != undefined && port.vendorId == vendorID && port.productId == productID){
          readerComPort = port.comName
          return
        }
      })
    }
    if(readerComPort != undefined) {
      readerPort = new SerialPort(readerComPort, {
        // RAW- Parser da die "Spec" verschiedene Commands sendet -.-
        parser: SerialPort.parsers.raw
      })

      // Verbindung ist offen
      readerPort.on('open', function(){
        rdyCallback()
      })

      // Es kommen Daten vom Reader rein. Erstmal verarbeiten!!!
      readerPort.on('data', function(data){
        /*
          Möglicher income:
            Manchmal kommt vor dem STX auch noch irgendwas anderes. Nicht genau definiert
            STX + Card-ID + CR + LF (Wenn eine Karte auf den Reader gelegt wurde)
            ESC (Tag wurde vom Reader entfernt)
            STX + Card-ID + CR + LF ( Manchmal kommt beides hintereinander)
            BEL (Der Knopf wurde gedrückt)
            STX = 0x02
            CARD-ID -> Bytes
            CR = 0x0D
            LF = 0x0A
            ESC = 0x1B
            BEL = 0x07
        */
        senderrorsound = false
        for(const value of data.values()){
          if(value == 0x07 && tagIDStartPos == -1){
            // Knopf wurde gedrückt
            // Weg hier
            sendErrorsound()
            continue
          }
          if(value == 0x1B){
            // Karte wurde entfernt.
            sendSuccessSound()
            continue
          }
          if(value == 0x02 && tagIDStartPos == -1){
            // Start der ID im nächsten
            tagIDStartPos = bufferNextPos
          }
          if((value == 0x0D || value == 0x0A) && tagIDStartPos > -1){
            // Mögliches Ende bei 0x0D
            // Ende nach 0x0A
            // Wird unten geprüft
            tagIDEndPos = bufferNextPos
          }
          dataBuffer[bufferNextPos] = value
          bufferNextPos++
        }
          if(tagIDEndPos > -1 && dataBuffer[tagIDEndPos] == 0x0A){
            if(dataBuffer[tagIDEndPos-1] == 0x0D){
              // Tag ID liegt zwischen tagIDStartPos+1 und tagIDEndPos-2
              
              tagID = ''
              for(var i = tagIDStartPos+1; i <= tagIDEndPos-2; i++){
                tagID += ('0' + dataBuffer[i].toString(16)).substr(-2)
              }
              bufferNextPos = 0
              tagIDStartPos = -1
              tagIDEndPos = -1
              sendSuccessSound()
              creatorDataCallback(tagID)
            }
          }
      })

      readerPort.on('close', function(data){
        creatorCloseCallback()
        // Callback is called with no arguments when the port is closed. In the event of an error, an error event will be triggered
      })

      readerPort.on('error', function(data){
        // Callback is called with an error object whenever there is an error.
      })

      readerPort.on('disconnect', function(data){
        // Callback is called with an error object. This will always happen before a close event if a disconnection is detected.
        // Close wird auf jeden fall gerufen
      })
    }
  }

  this.canRead = function(){
    if(readerPort != undefined) {
      return readerPort.isOpen()
    }
    return false
  }

  this.open = function(){
    if(readerPort != undefined && !readerPort.isOpen()){
      SerialPort.list(tryConnect)
    }else if(readerPort == undefined){
      SerialPort.list(tryConnect)
    }
  }

  this.close = function(){
    if(readerPort != undefined && readerPort.isOpen()){
      readerPort.close();
    }
  }

  SerialPort.list(tryConnect)
}

module.exports = RFIDReader