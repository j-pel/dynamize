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
    table.style.marginTop="-2px";
    elements[i].tHead.classList.add('fix-top');
    var page = table.parentNode;
    var scroller = document.createElement("div");
    page.insertBefore(scroller,table)
    page.removeChild(table);
    scroller.style.display = "block";
    ["width","height","maxWidth","maxHeight","minWidth","minHeight",
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
    scroller.addEventListener('scroll',onSingleScroll,false);
    scroller.addEventListener('resize', onResize, false);
  }

  var elements = document.getElementsByClassName('fix-top');
  for (var i = 0; i < elements.length; i++) {
    var table = elements[i].parentNode;
    var head = elements[i].cloneNode(true);
    head.classList.remove('fix-top');
    var fixed = table.parentNode.insertBefore(document.createElement("table"),table);
    fixed.classList.add('top-fixed');
    fixed.appendChild(head);
    fixed.style.position = "fixed";
    fixed.style.display = "none";
  }
  onResize();
  window.addEventListener('scroll', onMainScroll, false);
  window.addEventListener('resize', onResize, false);

  function onMainScroll() {
    var elements = document.getElementsByClassName('top-fixed');
    for (var e = 0; e < elements.length; e++) {
      var fixed = elements[e];
      var container = fixed.parentNode;
      var top = (container===document.body) ? fixed.nextSibling.offsetTop : container.offsetTop;
      var scroll = this.scrollY;
      var max = (container===document.body) ? fixed.nextSibling.offsetHeight : container.offsetHeight;
      if ((top < scroll) && (scroll < (top + max))) {
        var min = elements[e].tHead.rows[0].offsetHeight;
        fixed.style.top = "0px";
        fixed.style.marginTop = "-2px";
        fixed.style.left = fixed.nextSibling.offsetLeft-this.scrollX+"px"
        fixed.style.display = ((scroll - top - max + min) > 0) ? "none":"block"
      } else {
        if (container.scrollTop>0) {
          fixed.style.top = (container.offsetTop-scroll)+"px";
        } else {
          fixed.style.display = "none";
        }
      }
    }
  }

  function onSingleScroll() {
    var fixed = this.firstChild;
    var container = this;
    var top = container.offsetTop;
    var bigScroll = window.scrollY;
    var scroll = this.scrollTop;
    var max = container.offsetHeight;
    if (scroll > 0) {
      var min = fixed.rows[0].offsetHeight;
      fixed.style.top = (container.offsetTop-bigScroll)+"px";
      fixed.style.marginTop = "-2px";
      fixed.style.left = container.offsetLeft-this.scrollLeft+"px"
      fixed.style.display = "block";
    } else {
      fixed.style.display = "none";
    }
  }

  function onResize() {
    var elements = document.getElementsByClassName('top-fixed');
    for (var e = 0; e < elements.length; e++) {
      var head = elements[e].tHead.rows[0].cells;
      var body = elements[e].nextSibling.tHead.rows[0].cells;
      if (elements[e].parentNode===document.body) {
        var adjust = (document.body.offsetWidth < document.body.clientWidth) ?
          (document.body.clientWidth-document.body.offsetWidth):0;
      } else {
        var adjust = (document.body.offsetWidth < document.body.clientWidth) ?
          (document.body.clientWidth-document.body.offsetWidth-6):0;
      } 

      for (var i=0;i<body.length;i++) {
        if (head[i].clientWidth > body[i].clientWidth)
          body[i].style.minWidth = (head[i].clientWidth - (adjust/body.length)) + "px"
        else
          head[i].style.minWidth = (body[i].clientWidth-(adjust/body.length)) + "px";
      }
    }
  }

})();
