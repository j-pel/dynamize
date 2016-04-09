/*!
 * rotating.js
 *
 * Copyright © 2016 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/dynamize
 * 
 */

(function(exports) {

  'use strict';
	
	var changes = '';
	var rotating = new Object();
	var storeChanges = function(changes){};

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
		var elementList = document.getElementsByClassName('rotable');
		for (var i = 0; i < elementList.length; i++) {
			var ele = elementList[i];
			var box = document.createElement('div');
			ele.appendChild(box);
			if (!ele.id) {
				ele.id = "nn_r_"+i;
			}
			box.setAttribute('class', 'rotor');
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
		var elementList = [].slice.call(document.getElementsByClassName('rotor'));
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
		rotating=this.parentNode;
		rotating.started = true;
		document.addEventListener("mousemove", handleMouseMove, true);
		document.addEventListener("mouseup", handleMouseUp, true);
		event.preventDefault();
		event.stopPropagation();
    if (!window.scrollX) {
			rotating.mouseX = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
			rotating.mouseY = event.clientY + document.documentElement.scrollTop + document.body.scrollTop;
    } else {
			rotating.mouseX = event.clientX + window.scrollX;
			rotating.mouseY = event.clientY + window.scrollY;
    }
	}

	var handleMouseMove = function (event) {
		if (!rotating.started) return;
		event = event || window.event;
		var x, y;
    if (!window.scrollX) {
			x = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
			y = event.clientY + document.documentElement.scrollTop + document.body.scrollTop;
    } else {
			x = event.clientX + window.scrollX;
			y = event.clientY + window.scrollY;
    }
		x = x - rotating.mouseX;
		y = y - rotating.mouseY;
		changes = 'rotate('+(x+y)+'deg)';
		rotating.style.transform = changes;
	}

	var handleMouseUp = function (event) {
		rotating.started = false;
		if (changes!='') {
			storeChanges([rotating.id+".style.transform="+changes]);
		}
		document.removeEventListener("mousemove", handleMouseMove, true);
		document.removeEventListener("mouseup", handleMouseUp, true);
	}
	
})(typeof exports === 'undefined'? this['rotating']={}: exports);
