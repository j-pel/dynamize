/*!
 * multipane.js
 *
 * Copyright © 2017 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/dynamize
 * 
 */

(function(exports) {

  'use strict';

  const self = {
    vertical_div: 200,
    scrollX: 0,
    scrollY: 0,
  }

  const syncScroll = exports.scroll = (x, y) => {
    const elems = self.parent.childNodes;
    for (let e = 0; e<elems.length; e++) {
      if (elems[e].classList.contains("pane")){
        elems[e].lastChild.scrollTop = y;
      }
    }
  }

  const pane = exports.pane = (obj, options) => {
    self.parent = obj;
    obj.style.display = "flex";
    const scrollh = document.createElement("div");
    const body = document.createElement("div");
    const scrollv = document.createElement("div");
    const p = document.createElement("div");
    p.classList.add("pane");
    p.style.backgroundColor = options.color;
    const onResize = (e) => {
      const header = scrollh.firstChild;
      let wid = header.offsetWidth;
      if (p.offsetWidth>wid) wid = p.offsetWidth;
      body.style.width = wid + "px";
      scrollv.style.width = body.style.width;
      scrollv.style.height = (p.offsetHeight - scrollh.offsetHeight) + "px";
      body.style.height = scrollv.style.height;
    }
    if (options.width) p.style.width = options.width;
    obj.appendChild(p);
    p.onresize = onResize;
		p.appendChild(scrollh);
		p.appendChild(body);
    p.style.overflowX = "auto";
    p.style.overflowY = "clip";
    body.style.overflowX = "clip";
    body.style.overflowY = "auto";
		body.appendChild(scrollv);
    p.header = (contents) => {
      contents.style.width = "max-content";
      scrollh.appendChild(contents)
      onResize();
    };
    p.append = (contents) => {
      scrollv.appendChild(contents);
      onResize();
    }
    body.addEventListener('scroll', (e) => {
      syncScroll(e.target.scrollLeft, e.target.scrollTop);
    });
    return p;
  } 

  const divider = exports.divider = (obj, options) => {
    let pageX, thisCol, nextCol, curWidth, nextWidth;
    let d = document.createElement("div");
    d.classList.add("divider");
    obj.appendChild(d);
    d.addEventListener('mousedown', (e) => {
     thisCol = e.target.previousElementSibling;
     nextCol = e.target.nextElementSibling;
     pageX = e.pageX;
     curWidth = thisCol.offsetWidth
     if (nextCol)
      nextWidth = nextCol.offsetWidth
    });
   
    document.addEventListener('mousemove', (e) => {
     if (thisCol) {
      var dX = e.pageX - pageX;
      if (nextCol) nextCol.style.width = (nextWidth - dX)+'px';
      thisCol.style.width = (curWidth + dX)+'px';
      thisCol.onresize();
      e.preventDefault();
    }
    });
   
   document.addEventListener('mouseup', (e) => { 
      thisCol = undefined;
      nextCol = undefined;
      pageX = undefined;
      nextWidth = undefined;
      curWidth = undefined;
    });

    return d;
  } 

	var refresh = exports.refresh = () => {
		onResize();
		document.getElementById('pane_r').tabIndex = -1;
		//document.getElementById('pane_r').focus();
	}

})(typeof exports === 'undefined'? this['multipane']={}: exports);
