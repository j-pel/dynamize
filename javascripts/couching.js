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
    var idx = database.lastIndexOf('/')+1;
    self.db = database.slice(idx);
    self.server = database.slice(0,idx);
    //server: database.match(/^https?\:\/\/[^\/?#]+(?:[\/?#]|$)/i)[0]
  }
  
	/*!
	 * head(id, callback)
   * The lightest and fastest call to seek for a document knowing its
   * id. It will return the current revision number if the document
   * exists. Otherwise, it will return 404 (not found).
	 * 
	 * @param {id} document internal id.
	 * @param {callback} function to receive CouchDB answer.
	 * @api public
	 */
  self.head = function(id, callback) {
    var req = new XMLHttpRequest();
    req.open('HEAD', self.server + self.db + "/" + id);
    req.onreadystatechange=function() {
      if (req.readyState==4) {
        callback(req.getAllResponseHeaders())
      }
    }
    req.send(null);
    return(0);
  }

	/*!
	 * get(id, callback)
   * To retrieve the document with given id. It will return the current
   * document as a javascript object if the document exists. Otherwise,
   * it will return 404 (not found).
	 * 
	 * @param {id} document internal id.
	 * @param {callback} function to receive CouchDB answer.
	 * @api public
	 */
  self.get = function(id, callback) {
    var req = new XMLHttpRequest();
    req.addEventListener("load",function(evt) {
			callback(this);
		})
    req.open('GET', self.server + self.db + "/" + id);
    req.send();
  }

	/*!
	 * delete(id, callback)
   * To delete the document with given id and current revision.
   * If successful, it will return the revision id for the deletion stub.
   * Otherwise, it will return 404 (not found).
   * Deleted documents remain in the database forever, even after
   * compaction, to allow eventual consistency when replicating.
   * If you delete using this DELETE method, only the _id, _rev
   * and a deleted flag are preserved. If you deleted a document by
   * adding "_deleted":true then all the fields of the document are
   * preserved. This is to allow, for example, recording the time you
   * deleted a document, or the reason you deleted it. (Implementation
   * of the latter is pending)
	 * 
	 * @param {id} document internal id.
	 * @param {callback} function to receive CouchDB answer.
	 * @api public
	 */
  self.delete = function(id, callback) {
    self.head(id, function(){
      deleteDoc(this, id, callback);
    });
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
      });
    } else {
      self.get(self.server + "_uuids",function(){
        storeDoc(this, doc, callback);
      });
    }
  }

	/*!
	 * post(doc, callback)
   * To store new documents into the database. Unlike put call, it will
   * always create a new document with an id that is assigned during
   * document creation. Any id passed in doc is discarded.
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
    self.get(self.server + "_uuids",function(evt){
      storeDoc(this, doc, callback);
    });
  }

	/*!
	 * view(design, view, options, callback)
   * To query a map design/view on the database considering the
   * options' values. The resulted documents will be passed
   * to the callback function.
	 * 
	 * @param {design} name of the design document.
	 * @param {view} name of the view as defined on design document.
	 * @param {options} query options as a javascript object.
	 * @param {callback} function to receive CouchDB answer.
	 * @api public
	 */
  self.view = function(design, view, options, callback) {
    var req = new XMLHttpRequest();
    req.addEventListener("load",function(evt) {
			callback(this);
		});
    var query = "";
    for (opt in options) {
			query += encodeURI(opt+"="+options[opt]+"&");
		}
    req.open('GET', self.server + self.db + "/_design/" + design 
      + "/_view/" + view + "?" + query.slice(0,-1));
    req.send();
  }

	/*!
	 * storeDoc(req, doc, callback)
   * Helper fucntion to store a document into the database.
   * If the document does not exist, the document is created.
   * If the document does not contain an id, one UUID is provided.
	 * 
	 * @param {req} request from a CouchDB query.
	 * @param {doc} new/revised document as a javascript object.
	 * @param {callback} function to receive CouchDB answer.
	 * @api private
	 */
  function storeDoc(req, doc, callback) {
    if (req.status==404) {
      var obj = doc;
    } else {
      var obj = JSON.parse(req.responseText);
      if (obj.uuids) {
        doc._id = obj.uuids[0];
        obj = doc;
      } else {
        for (var prop in doc) {
          obj[prop] = doc[prop];
        }
      }
    }
    var req = new XMLHttpRequest();
    req.addEventListener("load", callback)
    req.open('PUT', self.server + self.db + "/" + obj._id);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(obj));
  }

	/*!
	 * deleteDoc(req, doc, callback)
   * Helper fucntion to delete a document from the database.
   * If the document does not exist, nothing happens.
	 * 
	 * @param {req} request from a CouchDB query.
	 * @param {id} existing document id.
	 * @param {callback} function to receive CouchDB answer.
	 * @api private
	 */
  function deleteDoc(req, id, callback) {
    if (req.status==404) {
      // what happens if the id is not found
    } else {
      var obj = JSON.parse(req.responseText);
    }
    var req = new XMLHttpRequest();
    req.addEventListener("load", callback)
    req.open('DELETE', self.server + self.db + "/" + obj._id + 
      "?rev=" + rev);
    req.send();
  }

  self.init(database);
  return(self);
}
