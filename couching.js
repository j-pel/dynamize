/*!
 * couching.js
 *
 * Copyright © 2016 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/dynamize
 * 
 * UNDER DEVELOPMENT: API frozen but incomplete
 * May be used for production but not recomended
 * 
 */

/* Object Constructor */

/*!
 * Couching(server)
 * Starts or changes the database handler to a specific server.
 * It verifies that the server is a proper CouchDB instance and
 * opens or create the database of given name.
 * 
 * @param {database} full HTTP address of a CouchDB compatible database.
 * @api public
 */

function Couching(database) {

  'use strict';

  self = {}

  var url = database.match(/(^https?\:\/\/)([^@]+@|)([^\/?#]+(?:[\/?#]|$))([^\/?#]+(?:[\/?#]|$))/i);
  self.protocol = url[1];
  self.basicauth = window.btoa(url[2].slice(0,-1));
  self.host = url[3];
  self.db = url[4];
  reqJSON('GET', self.protocol + self.host + self.db)
  .then(function(data){
    self.info = data;
  }).catch(function(err){
    self.error = err;
  });
  
  /* client API */
  
  /*!
   * login(user)
   * To verify user credentials to the system and start a session for
   * the given user. If the credentials are incorrect, the session
   * is closed and the database is in visitors' access state.
   * 
   * A Promise is returned with the given authorization or an error.
   * 
   * @param {user} object containing user.name and user.password.
   * @api public
   */
	self.login = function(user) {
    return new Promise(function(resolve,reject) {
      reqJSON('POST', self.protocol + self.host + "_session",user)
      .then(function(data){
        self.basicauth = window.btoa(user.name+":"+user.password);
        self.roles = data.roles;
        resolve(data);
      }).catch(function(err){
        self.basicauth = "";
        self.roles = [];
        reject(err);
      })
    });
  }

  /*!
   * create()
   * To create a new database on the CouchDB instance.
   * It works only if the logged user has admin capabilities.
   * 
   * @api public
   */
	self.create = function() {
    return new Promise(function(resolve,reject) {
      reqJSON('PUT', self.protocol + self.host + self.db)
      .then(function(data){
        self.info=data;
        resolve(data);
        return(0);
      }).catch(function(err){
        self.error=err;
        reject(err);
        return(0);
      });
    });
  };

  /*!
   * clear()
   * To delete the entire database from CouchDB instance.
   * It works only if the logged user has admin capabilities.
   * 
   * @api public
   */
	self.clear = function() {
    return new Promise(function(resolve,reject) {
      reqJSON('DELETE', self.protocol + self.host + self.db)
      .then(function(data){
        self.info=null;
        resolve(data);
        return(0);
      }).catch(function(err){
        self.error=err;
        reject(err);
        return(0);
      });
    });
  };

  /*!
   * session()
   * To get the current session information from CouchDB.
   * 
   * A Promise is returned with the required information or error.
   * 
   * @api public
   */
	self.session = function() {
    return new Promise(function(resolve,reject) {
      reqJSON('GET', self.protocol + self.host + "_session")
      .then(function(data){
        resolve(data);
      }).catch(function(err){
        reject(err);
      })
    });
	}

  /*!
   * head(id)
   * The lightest and fastest call to seek for a document knowing its
   * id. It will return the header information as a javascript object
   * with a property called ETag with the current revision number
   * if the document exists. Otherwise, the object will have an error
   * property plus the other header information.
   * 
   * A Promise is returned with the required header or error message.
   * 
   * @param {id} document internal id.
   * @api public
   */
  self.head = function(id) {
    var req = new XMLHttpRequest();
    return new Promise(function(resolve,reject) {
      req.open('HEAD', self.protocol + self.host + self.db + "/" + id);
      req.onreadystatechange=function() {
        if (req.readyState==4) {
          var head = req.getAllResponseHeaders();
          if (req.status == 404) {
            reject({error: "not_found", reason: "missing"})
          } else {
            var obj = {};
            var list = head.split("\n").forEach(function(row){
              var cell = row.split(":");
              if (cell[1]) obj[cell[0].toLowerCase()] =
                cell[1].replace(/<(.*)>/, '$1').trim().replace(/"/g,"");
            }); // Lower case to work around browsers' implementations
            resolve(obj);
          }
        }
      }
      req.send(null);
    });
  }

  /*!
   * get(id)
   * To retrieve the document with given id. It will return the current
   * document as a javascript object if the document exists. Otherwise,
   * it will return {Error: not found}.
   * 
   * A Promise is returned with the required document or error message.
   * 
   * @param {id} document internal id.
   * @api public
   */
  self.get = function(id) {
    return new Promise(function(resolve,reject) {
      reqJSON('GET', self.protocol + self.host + self.db + "/" + id)
      .then(function(data){
        resolve(data);
      }).catch(function(err){
        reject(err);
      });
    });
  }

  /*!
   * uuid(count)
   * Requests one or more Universally Unique Identifiers (UUIDs) from
   * the CouchDB instance. The response is a JSON object providing a
   * list of UUIDs.
   * 
   * A Promise is returned with an array with the UUIDs.
   * 
   * @param {count} Number of UUIDs to return. Default is 1.
   * @api public
   */
  self.uuid = function(count=1) {
    return new Promise(function(resolve,reject) {
      reqJSON('GET', self.protocol + self.host + "_uuids?count="+count)
      .then(function(data){
        resolve(data.uuids);
      }).catch(function(err){
        reject(err);
      });
    });
  }

  /*!
   * delete(id)
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
   * @api public
   */
  self.delete = function(id) {
    return new Promise(function(resolve,reject) {
      self.head(id)
      .then(function(data) {
        console.log("Head is", data);
        reqJSON('DELETE', self.protocol + self.host + self.db + "/" +
          id + "?rev=" + data.etag)
        .then(function(data1){
          resolve(data1);
        })
        .catch(function(err1){
          reject(err1);
        })
      })
      .catch(function(err) {
        reject(err);
      });
    });
  }

  /*!
   * put(doc)
   * To store new documents into the database or to revise an existing
   * document. If the document does not contain an id, a new uuid is
   * assigned.
   * If the document exists, a new revision is generated.
   * 
   * A Promise is returned with the response from CouchDB.
   * 
   * @param {doc} document as a javascript object.
   * @api public
   */
  self.put = function(doc) {
    if (!doc._id) { // recursive call when doc._id is missing
      self.uuid(1)
      .then(function(data) {
        doc._id = data[0];
        return(self.put(doc));
      });
    } else {        // main put call to return a Promise
      return new Promise(function(resolve,reject) {
        self.get(doc._id)
        .then(function(data) {
          for (var prop in doc) {
            data[prop] = doc[prop];
          }
          reqJSON('PUT', self.protocol + self.host + self.db + "/" +
            doc._id, data)
          .then(function(data1){
            resolve(data1);
          })
          .catch(function(err1){
            reject(err);
          })
        })
        .catch(function(err) {
          reqJSON('PUT', self.protocol + self.host + self.db + "/" +
            doc._id, doc)
          .then(function(data1){
            resolve(data1);
          }).catch(function(err1){
            reject(err);
          })
        });
      });
    }
  }

  /*!
   * post(doc)
   * To store new documents into the database. Unlike put call, it will
   * always create a new document with an id that is assigned during
   * document creation. If doc._id is passed, it is discarded.
   * 
   * This implementation does not use the POST method. The reason comes
   * from CouchDB docs: "It is recommended that you avoid POST when
   * possible, because proxies and other network intermediaries will
   * occasionally resend POST requests, which can result in duplicate
   * document creation."
   * 
   * A Promise is returned with the response from CouchDB.
   * 
   * @param {doc} document as a javascript object.
   * @api public
   */

  self.post = function(doc) {
    if (doc._id) {
      doc._id = undefined;
    }
    return(self.put(doc));
  }

  /*!
   * query(view, options)
   * To query a map design/view on the database considering the
   * options' values. The resulted documents will be passed
   * to the callback function.
   * 
   * A Promise is returned with the query result from CouchDB.
   * 
   * @param {view} name of the design/view as defined on database.
   * @param {options} query options as a javascript object.
   * @api public
   */
  self.query = function(view, options) {
    var query = "";
    view = view.split("/");
    for (var opt in options) {
      query += encodeURI(opt+"="+options[opt]+"&");
    }
    return new Promise(function(resolve,reject) {
      reqJSON('GET', self.protocol + self.host + self.db +
        "/_design/" + view[0] + "/_view/" + view[1] +
        "?" + query.slice(0,-1))
      .then(function(data){
        resolve(data);
      }).catch(function(err){
        reject(err);
      });
    });
  }

  /* private helpers */
    
  function reqJSON(method, url, args=null) {
    var xhr = new XMLHttpRequest();
    return new Promise(function(resolve, reject) {
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          switch (xhr.status) {
          case 200:
          case 201:
            resolve(JSON.parse(xhr.responseText));
            break;
          case 400: //400 Bad Request – Invalid database name
          case 401: //401 Unauthorized – CouchDB Server Administrator privileges required
          case 412: //412 Precondition Failed – Database already exists
          default:
            reject(JSON.parse(xhr.responseText));
          }
        }
      };
      xhr.open(method, url, true);
      if (self.basicauth!="") 
        xhr.setRequestHeader('Authorization', 'Basic ' + self.basicauth);
      if (args && (method === 'POST' || method === 'PUT')) {
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(args));
      } else {
        xhr.send(null)
      }
    });
  }

  return(self);
	
}
