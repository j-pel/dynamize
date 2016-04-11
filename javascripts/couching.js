/*!
 * couching.js
 *
 * Copyright © 2016 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/dynamize
 * 
 */

function Couching(database) {

  self = {}
  
	/* client API */
	
	/*!
	 * init(server)
	 * Starts or changes the database handler to a specific server.
	 * 
	 * @param {srv} full HTTP address of a CouchDB compatible database.
	 * @api public
	 */
	self.init = function(database) {
    var idx = database.lastIndexOf('/');
    self.db = database.slice(idx);
    self.server = database.slice(0,idx);
    //server: database.match(/^https?\:\/\/[^\/?#]+(?:[\/?#]|$)/i)[0]
  }
  
  self.head = function(id, callback) {
    var req = new XMLHttpRequest();
    req.addEventListener("load",callback)
    req.open('HEAD', self.db + "/" + id);
    req.send();
  }

  self.get = function(id, callback) {
    var req = new XMLHttpRequest();
    req.addEventListener("load",callback)
    req.open('GET', self.db + "/" + id);
    req.send();
  }

  self.delete = function(id, callback) {
    var req = new XMLHttpRequest();
    req.addEventListener("load",callback)
    req.open('DELETE', self.db + "/" + id);
    req.send();
  }

  self.view = function(design, view, options, callback) {
    var req = new XMLHttpRequest();
    req.addEventListener("load",callback)
    req.open('GET', self.db + "/_design/" + design 
      + "/_view/" + view + "?" + options);
    req.send();
  }

	/*!
	 * put(doc, callback)
   * To store new documents into the database or to revise an existing
   * document. If the document does not contain an id, a new id is
   * assigned.
	 * 
	 * @param {doc} document as a javascript object.
	 * @param {callback} function to receive CouchDB answer.
	 * @api public
	 */
  self.put = function(doc, callback) {
    if (doc._id) {
      self.get(doc._id,function(){
        storeDoc(this, doc, callback);
      })
    } else {
      storeDoc(this, doc, callback);
    }
  }

	/*!
	 * post(doc, callback)
   * To store new documents into the database. Unlike put call, it will
   * always create a new document with an id that is assigned during
   * document creation.
   * 
   * This implementation does not use the POST method. The reason comes
   * from CouchDB docs: "It is recommended that you avoid POST when
   * possible, because proxies and other network intermediaries will
   * occasionally resend POST requests, which can result in duplicate
   * document creation."
	 * 
	 * @param {doc} document as a javascript object.
	 * @param {callback} function to receive CouchDB answer.
	 * @api public
	 */

  self.post = function(doc, callback) {
    if (doc._id) {
      doc._id = undefined;
    }
    storeDoc(this, doc, callback);
  }

  function storeDoc(req, doc, callback) {
    if (req.status==404) {
      var obj = doc;
    } else {
      var obj = JSON.parse(req.responseText);
      for (var prop in doc) {
        obj[prop] = doc[prop];
      }
    }
    var req = new XMLHttpRequest();
    req.addEventListener("load", callback)
    req.open('PUT',self.db + "/" + obj._id);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(obj));
  }

  self.init(database);
  return(self)
}
