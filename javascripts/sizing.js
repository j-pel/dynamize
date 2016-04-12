/*!
 * sizing.js
 *
 * Copyright © 2016 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/dynamize
 * 
 */

(function(exports) {

  'use strict';
	
	var storeChanges = function(changes){};
	var sizing = new Object();
	
	/* client API */
	
	/*!
	 * init(store)
	 * Starts the handling of the proposed feature
	 * A default id is assigned to elements with no id given.
	 * 
	 * @param {store} callback to receive the elements' changes.
	 * @api public
	 */
	var init = exports.init = function(store) {
		storeChanges = store;
		var elementList = document.getElementsByClassName('sizable');
		for (var i = 0; i < elementList.length; i++) {
			var ele = elementList[i];
			var box = document.createElement('div');
			ele.appendChild(box);
			if (!ele.id) {
				ele.id = "nn_s_"+i;
			}
			box.setAttribute('class', 'sizer');
			box.addEventListener('mousedown', handleMouseDown, false);
		}
		return 0;
	}

	/*!
	 * stop()
	 * Stops the handling of the proposed feature.
	 * 
	 * @api public
	 */
	var stop = exports.stop = function() {
		var elementList = [].slice.call(document.getElementsByClassName('sizer'));
		elementList.forEach(function(ele){
			ele.removeEventListener('mousedown', handleMouseDown, false);
			ele.parentNode.removeChild(ele);
		});
		return 0;
	}

	function log(msg) {
		var p = document.getElementById('log');
		p.innerHTML = msg + "\n" + p.innerHTML;
	}

	var handleMouseDown = function (event) {
		event = event || window.event;
		sizing=this.parentNode;
		sizing.started = true;
		document.addEventListener("mousemove", handleMouseMove, true);
		document.addEventListener("mouseup", handleMouseUp, true);
		event.preventDefault();
		event.stopPropagation();
    if (!window.scrollX) {
			sizing.mouseX = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
			sizing.mouseY = event.clientY + document.documentElement.scrollTop + document.body.scrollTop;
    } else {
			sizing.mouseX = event.clientX + window.scrollX;
			sizing.mouseY = event.clientY + window.scrollY;
    }
		sizing.startX = sizing.offsetWidth;
		sizing.startY = sizing.offsetHeight;
	}

	var handleMouseMove = function (event) {
		if (!sizing.started) return;
		event = event || window.event;
		var x, y;
    if (!window.scrollX) {
			x = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
			y = event.clientY + document.documentElement.scrollTop + document.body.scrollTop;
    } else {
			x = event.clientX + window.scrollX;
			y = event.clientY + window.scrollY;
    }
		x = sizing.startX + x - sizing.mouseX;
		y = sizing.startY + y - sizing.mouseY;
		sizing.style.width=(x < 0)? '0px' : x+'px';
		sizing.style.height=(y < 0)? '0px' : y+'px';
	}

	var handleMouseUp = function (event) {
		sizing.started = false;
		var changes = [];
		if (sizing.startX != parseInt(sizing.style.width)) {
			changes.push(sizing.id+".style.width='"+sizing.style.width);
		}
		if (sizing.startY != parseInt(sizing.style.height)) {
			changes.push(sizing.id+".style.height = '"+sizing.style.height);
		}
		storeChanges(changes);
		var evt = new CustomEvent("resize",{detail: {},bubbles: true,cancelable: true});
		sizing.dispatchEvent(evt);
		document.removeEventListener("mousemove", handleMouseMove, true);
		document.removeEventListener("mouseup", handleMouseUp, true);
	}
	
})(typeof exports === 'undefined'? this['sizing']={}: exports);
