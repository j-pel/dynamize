/*!
 * multipane.js
 *
 * Copyright © 2017 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/dynamize
 * 
 */

(function(exports) {

  'use strict';

	var refresh = exports.refresh = function() {
		onResize();
		document.getElementById('pane_r').tabIndex = -1;
		//document.getElementById('pane_r').focus();
	}

  /*
   * Private utils to modify the DOM in order to create the panes
   */

  var elements = document.getElementsByClassName('multipane');
  for (var i = 0; i < elements.length; i++) {
		var pane = document.createElement("div");
		pane.id = "head_l";
		elements[i].appendChild(pane);
		var pane = document.createElement("div");
		pane.id = "pane_l";
		elements[i].appendChild(pane);
		pane.addEventListener('mousewheel', onScroll_l, false);
		var pane = document.createElement("div");
		pane.id = "head_r";
		elements[i].appendChild(pane);
		var pane = document.createElement("div");
		pane.id = "pane_r";
		elements[i].appendChild(pane);
		pane.addEventListener('scroll', onScroll_r, false);
		window.addEventListener('resize', onResize, false);
  }

	var assign = exports.assign = function(obj) {
    return new Promise(function(resolve,reject) {
			obj.classList.add("multipane");
			obj.style.overflow = "hidden";
			var pane = document.createElement("div");
			pane.id = "head_l";
			obj.appendChild(pane);
			var pane = document.createElement("div");
			pane.id = "pane_l";
			obj.appendChild(pane);
			pane.addEventListener('mousewheel', onScroll_l, false);
			var pane = document.createElement("div");
			pane.id = "head_r";
			obj.appendChild(pane);
			var pane = document.createElement("div");
			pane.id = "pane_r";
			obj.appendChild(pane);
			pane.addEventListener('scroll', onScroll_r, false);
			window.addEventListener('resize', onResize, false);
			resolve(obj);
		});
	}

	function onResize() {
		var head_l = document.getElementById('head_l');
		var head_r = document.getElementById('head_r');
		var pane_l = document.getElementById('pane_l');
		var pane_r = document.getElementById('pane_r');
		var parent = head_l.parentNode;
		pane_l.style.height = "0px";
		pane_r.style.height = "0px";
		var cnTop = head_l.offsetTop + head_l.offsetHeight;
		pane_l.style.top = (cnTop + 3)+"px";
		pane_l.style.width = (head_l.offsetWidth - 1) + "px";
		head_r.style.height = (head_l.offsetHeight - 1) + "px";
		head_r.style.left = (head_l.offsetWidth - 1) + "px";
		pane_r.style.left = (head_l.offsetWidth - 0) + "px";
		pane_r.style.width = (parent.offsetWidth - head_l.offsetWidth - 2) + "px";
		pane_r.style.height = (parent.offsetHeight - cnTop - 1) + "px";
		pane_r.style.top = (cnTop - 0)+"px";
		var hasScroll = parseInt(pane_r.scrollHeight) > parseInt(pane_r.offsetHeight) ? 16:0;
		hasScroll = 16;
		head_r.style.width = (pane_r.offsetWidth - hasScroll) + "px";
		var hasScroll = parseInt(pane_r.scrollWidth) > parseInt(pane_r.offsetWidth) ? 16:0;
		hasScroll = 16;
		pane_l.style.height = (parent.offsetHeight - cnTop - hasScroll) + "px";
	}

	function onScroll_r(evt) {
		document.getElementById('pane_l').scrollTop = this.scrollTop;
		document.getElementById('head_r').scrollLeft = this.scrollLeft;
	}

	function onScroll_l(evt) {
		if (evt.wheelDeltaY)
			document.getElementById('pane_r').scrollTop -= evt.wheelDeltaY;
		else
			document.getElementById('pane_r').scrollTop -= evt.wheelDelta;
	}

})(typeof exports === 'undefined'? this['multipane']={}: exports);
