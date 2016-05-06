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

  'use strict';

  self = {}
  
  /* client API */
  
  /*!
   * init(server)
   * Starts or changes the database handler to a specific server.
   * It verifies that the server is a proper CouchDB instance and
   * opens or create the database of given name.
   * 
   * @param {database} full HTTP address of a CouchDB compatible database.
   * @api public
   */
  self.init2 = function(database) {
    var url = database.match(/(^https?\:\/\/)([^@]+@|)([^\/?#]+(?:[\/?#]|$))([^\/?#]+(?:[\/?#]|$))/i);
    self.protocol = url[1];
    self.basicauth = Base64.encode(url[2].slice(0,-1));
    self.host = url[3];
    self.db = url[4];
    self.promise = new Promise(function (resolve, reject) {
      var req = new XMLHttpRequest();
      req.onreadystatechange=function() {
        if (req.readyState==4) {
          switch (req.status) {
          case 0:
            self.status = "no server";
            //console.log("no server", req.responseText);
            break;
          case 200:
            self.status = "database ok";
            resolve(this.response);
            //console.log("open", JSON.parse(this.responseText));
            break;
          case 404:
            self.status = "no database";
            createDatabase();
            reject(this.statusText);
            break;
          default:
            self.status = "error";
            console.log("error", req.responseText);
          }
        }
      }
      req.open('GET', self.protocol + self.host + self.db);
      req.send(null);
    });
    return(self);
  }

  function reqJSON(op,url,params=null) {
    var xhr = new XMLHttpRequest();
    return new Promise(function(resolve, reject) {
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(JSON.parse(xhr.responseText));
          }
        }
      };
      xhr.open(op, url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(params));
    });
  }

	self.login = function(user) {
    return new Promise(function(resolve,reject) {
      reqJSON('POST', self.protocol + self.host + "_session",user)
      .then(function(data){
        self.basicauth = Base64.encode(user.name+":"+user.password);
        self.roles = data.roles;
        resolve(data);
      }).catch(function(err){
        self.basicauth = "";
        self.roles = [];
        reject(err);
      })
    });
  }


	self.login2 = function(user, callback) {
    var req = new XMLHttpRequest();
    req.open('POST', self.protocol + self.host + "_session", true);
    req.withCredentials = true;
		//req.setRequestHeader('Access-Control-Allow-Origin', '*');
		//req.setRequestHeader('Accept', 'application/json');
    req.onreadystatechange=function() {
      //console.log("Headers",req.getAllResponseHeaders());
      //console.log("Headers",req.getResponseHeader('Set-Cookie'));
      if (req.readyState==4) {
				//console.log("Response",this);
				obj = JSON.parse(this.responseText);
				if (req.status == 200) {
					self.basicauth = Base64.encode(user.name+":"+user.password);
					self.roles = obj.roles
				}
				callback(obj);
      }
    }
    //req.setRequestHeader('X-PINGOTHER', 'pingpong');
    //req.setRequestHeader('Content-Type', 'application/json');
    //req.setRequestHeader('X-CouchDB-WWW-Authenticate', 'Cookie');
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    //req.setRequestHeader('X-CouchDB-WWW-Authenticate', 'Cookie');
    //req.send(JSON.stringify(user));
    req.send('name='+user.name+'&password='+user.password);
    return(0);
	}

	self.session = function(callback) {
    var req = new XMLHttpRequest();
    req.open('GET', self.protocol + self.host + "_session");
    //req.setRequestHeader('X-CouchDB-WWW-Authenticate', 'Cookie');
    req.onreadystatechange=function() {
      if (req.readyState==4) {
				obj = JSON.parse(this.responseText)
				if (req.status == 200) {
				}
				callback(obj);
      }
    }
    req.setRequestHeader("Content-Type", "application/json");
    req.send(null);
    return(0);
	}

	self.clear = function() {
		console.log("deleting database ",self);
		deleteDatabase();
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
    req.open('HEAD', self.protocol + self.host + self.db + "/" + id);
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
    req.onreadystatechange=function() {
      var obj = JSON.parse(this.responseText);
      callback(obj);
    }
    req.open('GET', self.protocol + self.host + self.db + "/" + id);
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
      req.open('GET', self.protocol + self.host + self.db + "/" + doc._id);
    } else {
      req.open('GET', self.protocol + self.host + "_uuids");
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
    req.open('GET', self.protocol + self.host + "_uuids");
    req.send();
  }

  /*!
   * query(view, options, callback)
   * To query a map design/view on the database considering the
   * options' values. The resulted documents will be passed
   * to the callback function.
   * 
   * @param {view} name of the design/view as defined on database.
   * @param {options} query options as a javascript object.
   * @param {callback} function to receive CouchDB retrieved documents.
   * @api public
   */
  self.query = function(view, options, callback) {
    //if (self.status!="database ok") return(-1);
    var req = new XMLHttpRequest();
    req.onreadystatechange=function() {
      if (req.readyState==4) {
				obj = JSON.parse(this.responseText);
				callback(obj);
      }
    }
    var query = "";
    view = view.split("/");
    for (opt in options) {
      query += encodeURI(opt+"="+options[opt]+"&");
    }
    req.open('GET', self.protocol + self.host + self.db + "_design/" + view[0] 
      + "/_view/" + view[1] + "?" + query.slice(0,-1));
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
      var obj = JSON.parse(this.responseText);
      callback(obj);
    });
    req.open('PUT', self.protocol + self.host + self.db + "/" + obj._id);
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
      req.open('DELETE', self.protocol + self.host + self.db + "/" + id + 
        "?rev=" + head.ETag);
      req.send();
    }
  }

	function createDatabase() {
    if (!self.basicauth||self.basicauth=="") return(-1);
    var req = new XMLHttpRequest();
    req.open('PUT', self.protocol + self.host + self.db);
    req.setRequestHeader('Authorization', 'Basic ' + self.basicauth);
    req.onreadystatechange=function() {
      if (req.readyState==4) {
        switch (req.status) {
				case 0:
					self.status = "no server";
					//console.log("no server", req.responseText);
					break;
				case 201:
					self.status = "database ok";
					//console.log("open", JSON.parse(this.responseText));
					break;
				case 400: //400 Bad Request – Invalid database name
				case 401: //401 Unauthorized – CouchDB Server Administrator privileges required
				case 412: //412 Precondition Failed – Database already exists
					self.status = "no database";
					//console.log("creating fails for",req.status, req.responseText);
					break;
				default:
					self.status = "error";
					console.log("error", req.responseText);
				}
        //callback(obj);
      }
    }
    req.send(null);
    return(0);
	}		

	function deleteDatabase() {
    if (!self.basicauth||self.basicauth=="") return(-1);
    var req = new XMLHttpRequest();
    req.open('DELETE', self.protocol + self.host + self.db);
    req.setRequestHeader('Authorization', 'Basic ' + self.basicauth);
    req.onreadystatechange=function() {
      if (req.readyState==4) {
					console.log("delete", req.responseText);
        switch (req.status) {
				case 0:
					self.status = "no server";
					//console.log("no server", req.responseText);
					break;
				case 201:
					self.status = "database ok";
					//console.log("open", JSON.parse(this.responseText));
					break;
				case 400: //400 Bad Request – Invalid database name
				case 401: //401 Unauthorized – CouchDB Server Administrator privileges required
				case 412: //412 Precondition Failed – Database already exists
					self.status = "no database";
					//console.log("creating fails for",req.status, req.responseText);
					break;
				default:
					self.status = "error";
					console.log("error", req.responseText);
				}
        //callback(obj);
      }
    }
    req.send(null);
    return(0);
	}		
	
  var url = database.match(/(^https?\:\/\/)([^@]+@|)([^\/?#]+(?:[\/?#]|$))([^\/?#]+(?:[\/?#]|$))/i);
  self.protocol = url[1];
  self.basicauth = Base64.encode(url[2].slice(0,-1));
  self.host = url[3];
  self.db = url[4];
  reqJSON('GET', self.protocol + self.host + self.db)
  .then(function(data){
    self.info = data;
  }).catch(function(err){
    self.error = err;
  });
  return(self);
}

var Base64 = {
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	// public method for encoding
	encode : function (input) {
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;

			input = Base64._utf8_encode(input);

			while (i < input.length) {

					chr1 = input.charCodeAt(i++);
					chr2 = input.charCodeAt(i++);
					chr3 = input.charCodeAt(i++);

					enc1 = chr1 >> 2;
					enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
					enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
					enc4 = chr3 & 63;

					if (isNaN(chr2)) {
							enc3 = enc4 = 64;
					} else if (isNaN(chr3)) {
							enc4 = 64;
					};

					output = output +
					Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) +
					Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);

			}

			return output;
	},

	// public method for decoding
	decode : function (input) {
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;

			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

			while (i < input.length) {

					enc1 = Base64._keyStr.indexOf(input.charAt(i++));
					enc2 = Base64._keyStr.indexOf(input.charAt(i++));
					enc3 = Base64._keyStr.indexOf(input.charAt(i++));
					enc4 = Base64._keyStr.indexOf(input.charAt(i++));

					chr1 = (enc1 << 2) | (enc2 >> 4);
					chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
					chr3 = ((enc3 & 3) << 6) | enc4;

					output = output + String.fromCharCode(chr1);

					if (enc3 != 64) {
							output = output + String.fromCharCode(chr2);
					}
					if (enc4 != 64) {
							output = output + String.fromCharCode(chr3);
					}

			}

			output = Base64._utf8_decode(output);

			return output;

	},

	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";

			for (var n = 0; n < string.length; n++) {

					var c = string.charCodeAt(n);

					if (c < 128) {
							utftext += String.fromCharCode(c);
					}
					else if((c > 127) && (c < 2048)) {
							utftext += String.fromCharCode((c >> 6) | 192);
							utftext += String.fromCharCode((c & 63) | 128);
					}
					else {
							utftext += String.fromCharCode((c >> 12) | 224);
							utftext += String.fromCharCode(((c >> 6) & 63) | 128);
							utftext += String.fromCharCode((c & 63) | 128);
					}

			}

			return utftext;
	},

	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
			var string = "";
			var i = 0;
			var c = c1 = c2 = 0;

			while ( i < utftext.length ) {

					c = utftext.charCodeAt(i);

					if (c < 128) {
							string += String.fromCharCode(c);
							i++;
					}
					else if((c > 191) && (c < 224)) {
							c2 = utftext.charCodeAt(i+1);
							string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
							i += 2;
					}
					else {
							c2 = utftext.charCodeAt(i+1);
							c3 = utftext.charCodeAt(i+2);
							string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
							i += 3;
					}

			}
			return string;
	}
}
