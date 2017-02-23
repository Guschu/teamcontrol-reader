var expect = require('chai').expect
var Terminal = require('../models/terminal')
var sinon = require('sinon')
describe('Terminal', function() {
  describe('On empty Initialization', function() {
    it('should be initialized with undefined MAC-Address', function() {
      t = new Terminal()
      expect(t.getMacAddress()).to.be.undefined
      expect(t.getSplittedMacAddress()).to.be.undefined
    })
  })

  describe('#generate_connection_info', function() {
    var t   

    beforeEach(function(){
      t = new Terminal();
      t.setMacAddress('12131415')
    })
    it('should answer with check connection after initialization', function() {
      ci = t.generate_connection_info()
      expect(ci).to.have.property('status', 'wait')
      expect(ci).to.have.property('title', 'Verbindung mit dem Server fehlgeschlagen')
      expect(ci).to.have.property('message', 'Bitte Verbindung überprüfen')
      expect(ci).to.have.property('additional', undefined)
    })

    it('should answer with register station after connection set', function() {
      t.setConnected(true)
      ci = t.generate_connection_info()
      expect(ci).to.have.property('status', 'wait')
      expect(ci).to.have.property('title', 'Station in TeamControl registrieren')
      expect(ci).to.have.property('message', '12 13 14 15')
      expect(ci).to.have.property('additional', undefined)
    })

    it('should answer with reader needed after connection and server auth set', function(){
      t.setConnected(true)
      t.setAuthenticated(true)
      ci = t.generate_connection_info()
      expect(ci).to.have.property('status', 'wait')
      expect(ci).to.have.property('title', '')
      expect(ci).to.have.property('message', 'Warte auf Reader')
      expect(ci).to.have.property('additional', undefined)
    })

    it('should answer with ready after connection, server auth and reader set', function(){
      t.setConnected(true)
      t.setAuthenticated(true)
      t.setReaderRdy(true)
      ci = t.generate_connection_info()
      expect(ci).to.have.property('status', 'info')
      expect(ci).to.have.property('title', '')
      expect(ci).to.have.property('message', 'Bereit')
      expect(ci).to.have.property('additional', undefined)
    })

    it('should answer with no conection after connection is set to false', function(){
      t.setConnected(true)
      t.setAuthenticated(true)
      t.setReaderRdy(true)
      t.setConnected(false)
      ci = t.generate_connection_info()
      expect(ci).to.have.property('status', 'wait')
      expect(ci).to.have.property('title', 'Verbindung mit dem Server fehlgeschlagen')
      expect(ci).to.have.property('message', 'Bitte Verbindung überprüfen')
      expect(ci).to.have.property('additional', undefined)
    })

    it('should answer with register after authentication is set to false', function(){
      t.setConnected(true)
      t.setAuthenticated(true)
      t.setReaderRdy(true)
      t.setAuthenticated(false)
      ci = t.generate_connection_info()
      expect(ci).to.have.property('status', 'wait')
      expect(ci).to.have.property('title', 'Station in TeamControl registrieren')
      expect(ci).to.have.property('message', '12 13 14 15')
      expect(ci).to.have.property('additional', undefined)
    })

    it('should answer with register after connection was set to false and back to true', function(){
      t.setConnected(true)
      t.setAuthenticated(true)
      t.setReaderRdy(true)
      t.setConnected(false)
      t.setConnected(true)
      ci = t.generate_connection_info()
      expect(ci).to.have.property('status', 'wait')
      expect(ci).to.have.property('title', 'Station in TeamControl registrieren')
      expect(ci).to.have.property('message', '12 13 14 15')
      expect(ci).to.have.property('additional', undefined)
    })

  })

  describe('#checkTagId', function(){
    describe('when Terminal is not connected or authenticated', function(){
      var t
      tagId = '1A2B3C4D'
      var clock

      beforeEach(function(){
        t = new Terminal();
        t.setMacAddress('12131415')

        clock = sinon.useFakeTimers()
      })

      it('should return generated statusinfo when not connected or authenticated', function(){
        expect(t.checkTagId(tagId)).to.eql(t.generate_connection_info())
        t.setConnected(true)
        expect(t.checkTagId(tagId)).to.eql(t.generate_connection_info())
        t.setConnected(false)
        t.setAuthenticated(true)
        expect(t.checkTagId(tagId)).to.eql(t.generate_connection_info())
      })

      it('should return transmit data when tag is not scanned within last 5 seconds', function(){
        t.setConnected(true)
        t.setAuthenticated(true)
        sti = t.checkTagId(tagId)
        expect(sti).to.have.property('title', 'Daten werden übermittelt')
        expect(sti).to.have.property('status', 'info')
        expect(sti).to.have.property('message', 'Bitte warten')
        expect(sti).to.have.property('additional', undefined)
        clock.tick(6 * 1000);
        sti = t.checkTagId(tagId)
        expect(sti).to.have.property('title', 'Daten werden übermittelt')
        expect(sti).to.have.property('status', 'info')
        expect(sti).to.have.property('message', 'Bitte warten')
        expect(sti).to.have.property('additional', undefined)
      })

      it('should return wait 5 seconds when tag is was scanned within last 5 seconds', function(){
        t.setConnected(true)
        t.setAuthenticated(true)
        sti = t.checkTagId(tagId)
        expect(sti).to.have.property('title', 'Daten werden übermittelt')
        expect(sti).to.have.property('status', 'info')
        expect(sti).to.have.property('message', 'Bitte warten')
        expect(sti).to.have.property('additional', undefined)
        clock.tick(3 * 1000);
        sti = t.checkTagId(tagId)
        expect(sti).to.have.property('title', 'Zu häufig gescannt - Bitte 5 Sekunden warten')
        expect(sti).to.have.property('status', 'error')
        expect(sti).to.have.property('message', 'Bitte warten')
        expect(sti).to.have.property('additional', undefined)
        clock.tick(6 * 1000);
        sti = t.checkTagId(tagId)
        expect(sti).to.have.property('title', 'Daten werden übermittelt')
        expect(sti).to.have.property('status', 'info')
        expect(sti).to.have.property('message', 'Bitte warten')
        expect(sti).to.have.property('additional', undefined)
      })

    })
  })
})
