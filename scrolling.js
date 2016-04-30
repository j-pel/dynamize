/*!
 * scrolling.js
 *
 * Copyright © 2016 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/dynamize
 * 
 */

(function() {

  'use strict';

  var elements = document.getElementsByClassName('scrollable');
  for (var i = 0; i < elements.length; i++) {
    var table = elements[i];
    elements[i].tHead.classList.add('fix-top');
    var page = table.parentNode;
    var scroller = document.createElement("div");
    page.insertBefore(scroller,table)
    page.removeChild(table);
    scroller.style.display = "block";
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
    table.style.width = "100%";
    scroller.style.overflow = "scroll";
    scroller.appendChild(table);
  }

  var elements = document.getElementsByClassName('fix-top');
  for (var i = elements.length-1; elements.length > 0;i = elements.length-1) {
    var table = elements[i].parentNode;
    var head = elements[i].cloneNode(true);
    head.classList.remove('fix-top');
    var fixed = table.parentNode.insertBefore(document.createElement("table"),table);
    fixed.classList.add('top-fixed');
    fixed.appendChild(head);
    fixed.style.position = "sticky";
    fixed.style.top = "0px";
    fixed.style.width = "100%";
    table.removeChild(elements[i]);
  }
  window.addEventListener('resize', onResize, false);
  onResize();

  function onResize() {
    var elements = document.getElementsByClassName('top-fixed');
    for (var e = 0; e < elements.length; e++) {
      var head = elements[e].tHead.rows[0].cells;
      var body = elements[e].nextSibling.tBodies[0]
      if (body.rows.length==0) return(0);
      body = body.rows[0].cells;
      for (var i=0;i<body.length;i++) {
        head[i].style.minWidth = body[i].clientWidth + "px";
      }
    }
  }

})();
