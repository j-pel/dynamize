/*!
 * couching.js
 *
 * Copyright © 2016 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/dynamize
 * 
 * UNDER DEVELOPMENT: Anything can change
 * There are no safeguards
 * 
 */

  /* Object constructor */

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
   * id. It will return the header information as a javascript object
   * with a property called ETag with the current revision number
   * if the document exists. Otherwise, the object will have an error
   * property plus the other header information.
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
        var head = req.getAllResponseHeaders();
        var obj = (req.status == 404) ?
          {error: "not_found", reason: "missing"} : {};
        var list = head.split("\n").forEach(function(row){
          var cell = row.split(":");
          if (cell[1]) obj[cell[0]] =
            cell[1].replace(/<(.*)>/, '$1').trim().replace(/"/g,"");
        });
        callback(obj);
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
      var obj = JSON.parse(this.responseText);
      callback(obj);
    })
    req.open('GET', self.server + self.db + "/" + id);
    req.send();
  }

  /*!
   * delete(id, callback)
   * To delete the document with given id. Document current revision is
   * obtained by HEAD request to the database.
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
    self.head(id, function(head){
      deleteDoc(head, id, callback);
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
    var req = new XMLHttpRequest();
    req.addEventListener("load",function(evt) {
      storeDoc(this, doc, callback);
    })
    if (doc._id) {
      req.open('GET', self.server + self.db + "/" + doc._id);
    } else {
      req.open('GET', self.server + "/_uuids");
    }
    req.send();
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
    var req = new XMLHttpRequest();
    req.addEventListener("load",function(evt) {
      storeDoc(this, doc, callback);
    })
    req.open('GET', self.server + "_uuids");
    req.send();
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
    req.addEventListener("load", function(evt) {
      callback(this);
    });
    req.open('PUT', self.server + self.db + "/" + obj._id);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(obj));
  }

  /*!
   * deleteDoc(head, id, callback)
   * Helper fucntion to delete a document from the database.
   * If the document does not exist, nothing happens.
   * 
   * @param {head} header object from a HEAD CouchDB request.
   * @param {id} existing document id.
   * @param {callback} function to receive CouchDB answer.
   * @api private
   */
  function deleteDoc(head, id, callback) {
    if (head.error) {
      callback(head);
    } else {
      var req = new XMLHttpRequest();
      req.addEventListener("load", function(evt) {
        callback(this);
      });
      req.open('DELETE', self.server + self.db + "/" + id + 
        "?rev=" + head.ETag);
      req.send();
    }
  }

  self.init(database);
  return(self);
}
