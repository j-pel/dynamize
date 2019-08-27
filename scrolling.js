/*!
 * scrolling.js
 *
 * Copyright © 2016 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/dynamize
 * 
 */

(function(exports) {

  'use strict';

  /*!
   * refresh()
   * Resizes the fixed headers for all columns in accordance to
   * the table contents.
   * 
   * @api public
   */
  var refresh = exports.refresh = function() {
    var elements = document.getElementsByClassName('top-fixed');
    for (var e = 0; e < elements.length; e++) {
      var head = elements[e].rows[0].cells;
      var body = elements[e].parentNode.originalTable.tBodies[0]
      if (body.rows.length==0) return(0);
      for (var r=0;r<body.rows.length;r++){
        if (body.rows[r].clientHeight>0) break;        
      }
      if (r>=body.rows.length) return(0);
      body = body.rows[r].cells;
      var cols = (body.length<head.length)?head.length:body.length;
      for (var i=0;i<cols;i++) {
        if (!body[i]||!head[i]) break;
        head[i].firstElementChild.style.width = parseInt(body[i].clientWidth-6) + "px";
        head[i].style.width = body[i].clientWidth + "px";
      }
    }
  }

  /*
   * Private utils to modify the DOM in order to create the fixed headers
   */

  var elements = document.getElementsByClassName('scrollable');
  for (var i = 0; i < elements.length; i++) {
    var table = elements[i];
    var thead = elements[i].tHead;
    var page = table.parentNode;
    var header = document.createElement("div");
    var headert = document.createElement("table");
    var scroller = document.createElement("div");
    headert.originalTable = table;
    thead.classList.add('top-fixed');
    table.removeChild(thead);
    page.insertBefore(header,table);
    header.appendChild(headert);
    headert.appendChild(thead);
    page.insertBefore(scroller,table);
    page.removeChild(table);
    scroller.style.display = "block";
    ["width","maxWidth","minWidth","left","right"].forEach(function(prop){
      headert.style[prop] = table.style[prop];
      header.style[prop] = table.style[prop];
    });
    ["position","width","height","maxWidth","maxHeight","minWidth","minHeight",
    "top","left","bottom","right"].forEach(function(prop){
      scroller.style[prop] = table.style[prop];
    });
    ["movable","rotable","sizable"].forEach(function(cls){
      if(table.classList.contains(cls)) {
        scroller.classList.add(cls);
        table.classList.remove(cls);
      }
    });
    header.style.backgroundColor = "ButtonHighlight";
    table.style.width = "100%";
    table.tabIndex = 0;
    scroller.style.overflow = "scroll";
    scroller.appendChild(table);
    headert.style.width = parseInt(table.clientWidth) + "px";
  }

  var elements = document.getElementsByClassName('fix-top');
  for (var i = elements.length-1; elements.length > 0;i = elements.length-1) {
    var table = elements[i].parentNode;
    var head = elements[i].cloneNode(true);
    table.removeChild(thead);
    var theadt = document.createElement("table");
    theadt.appendChild(thead);
    head.classList.remove('fix-top');
    var fixed = table.parentNode.insertBefore(document.createElement("table"),table);
    fixed.classList.add('top-fixed');
    fixed.appendChild(head);
    fixed.style.position = "sticky";
    fixed.style.top = "0px";
    fixed.style.width = "100%";
    table.removeChild(elements[i]);
  }
  refresh();
  window.addEventListener('resize', onResize, false);

  function onResize() {
    refresh();
  }

/* NOTE: for triggering the resize event, in all browsers, use:
  var evt = window.document.createEvent('UIEvents'); 
  evt.initUIEvent('resize', true, false, window, 0); 
  window.dispatchEvent(evt);
*/

})(typeof exports === 'undefined'? this['scrolling']={}: exports);