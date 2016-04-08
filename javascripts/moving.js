/*!
 * moving.js
 *
 * Copyright © 2016 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/adjustjs
 * 
 */

(function(exports) {

  'use strict';
	
	/* properties */
	var storeChanges = function(changes){return(0)};
	var ongoingTouches = new Array();
	var moving = new Object();
	var touchMoving = false;
	
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
		var elementList = document.getElementsByClassName('movable');
		for (var i = 0; i < elementList.length; i++) {
			var ele = elementList[i];
			ele.addEventListener('mousedown', handleMouseDown, false);
			ele.style.cursor = 'move';
			if (!ele.id) {
				ele.id = "nn_m_"+i;
			}
		}
		document.addEventListener('touchstart', handleTouchStart, false);
		document.addEventListener("touchmove", handleTouchMove, true);
		document.addEventListener("touchleave", handleTouchEnd, true);
		document.addEventListener("touchend", handleTouchEnd, true);
		return 0;
	}

	/*!
	 * stop()
	 * Stops the handling of the proposed feature.
	 * 
	 * @api public
	 */
	var stop = exports.stop = function() {
		var elementList = document.getElementsByClassName('movable');
		for (var i = 0; i < elementList.length; i++) {
			var ele = elementList[i];
			ele.removeEventListener('mousedown', handleMouseDown, false);
			ele.style.cursor = 'auto';
		}
		document.removeEventListener('touchstart', handleTouchStart, false);
		document.removeEventListener("touchmove", handleTouchMove, true);
		document.removeEventListener("touchleave", handleTouchEnd, true);
		document.removeEventListener("touchend", handleTouchEnd, true);
		return 0;
	}

	/* private helpers */

	function log(msg) {
		var p = document.getElementById('status');
		p.innerHTML = msg + "\n" + p.innerHTML;
	}

	var handleMouseDown = function (event) {
		event = event || window.event;
		moving=this;
		moving.started = true;
		//log("Start moving " + this.innerHTML);
		document.addEventListener("mousemove", handleMouseMove, true);
		document.addEventListener("mouseup", handleMouseUp, true);
		event.preventDefault();
    if (!window.scrollX) {
			moving.mouseX = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
			moving.mouseY = event.clientY + document.documentElement.scrollTop + document.body.scrollTop;
    } else {
			moving.mouseX = event.clientX + window.scrollX;
			moving.mouseY = event.clientY + window.scrollY;
    }
		moving.startX = moving.offsetLeft;
		moving.startY = moving.offsetTop;
	}

	var handleMouseMove = function (event) {
		if (!moving.started) return;
		event = event || window.event;
		var x, y;
    if (!window.scrollX) {
			x = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
			y = event.clientY + document.documentElement.scrollTop + document.body.scrollTop;
    } else {
			x = event.clientX + window.scrollX;
			y = event.clientY + window.scrollY;
    }
		x = moving.startX + x - moving.mouseX;
		y = moving.startY + y - moving.mouseY;

		//log("Moving x = " + x + ", y = " + y);
		moving.style.left=(x < 0)? '0px' : x+'px';
		moving.style.top=(y < 0)? '0px' : y+'px';
    if (moving.firstChild.classList.contains("top-fixed")) {
      var evt = new CustomEvent("scroll",{detail: {},bubbles: true,cancelable: true});
      moving.dispatchEvent(evt);
    }
	}

	var handleMouseUp = function (event) {
		//log ("Stop moving " + moving.innerText);
		moving.started = false;
		var changes = [];
		if (parseInt(moving.startX) != parseInt(moving.style.left)) {
			changes.push(moving.id+".style.left="+moving.style.left);
		}
		if (parseInt(moving.startY) != parseInt(moving.style.top)) {
			changes.push(moving.id+".style.top="+moving.style.top);
		}
		storeChanges(changes);
		document.removeEventListener("mousemove", handleMouseMove, true);
		document.removeEventListener("mouseup", handleMouseUp, true);
	}

	var handleTouchStart = function (event) {
		var touches = event.changedTouches;
		for (var i=0; i < touches.length; i++) {
			if (touches[i].target.classList.contains('movable')) {
				touchMoving = true;
				ongoingTouches.push(copyTouch(touches[i]));
				//log("start touch "+i+ " on " +touches[i].target.innerHTML+" ("+touches[i].pageX+", "+touches[i].pageY+")");
			}
		}
	}

	var handleTouchMove = function (event) {
		if (!touchMoving) return;
		event.preventDefault();
		var touches = event.changedTouches;
		var x = 0;
		var y = 0;
		for (var i=0; i < touches.length; i++) {
			var idx = ongoingTouchIndexById(touches[i].identifier);
			if(idx >= 0) {
				x = touches[i].pageX - ongoingTouches[idx].pageX;
				y = touches[i].pageY - ongoingTouches[idx].pageY;
				//log("touch moving "+idx+" on "+ongoingTouches[idx].target.innerHTML+" ("+x+", "+y+")");
				ongoingTouches[idx].target.style.left = ongoingTouches[idx].target.offsetLeft + x + "px";
				ongoingTouches[idx].target.style.top = ongoingTouches[idx].target.offsetTop + y + "px";
				ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
			} else {
				log("can't figure out which touch to continue");
			}
		}
	}

	var handleTouchEnd = function (event) {
		if (!touchMoving) return;
		touchMoving = false;
		event.preventDefault();
		var touches = event.changedTouches;
		for (var i=0; i < touches.length; i++) {
			var idx = ongoingTouchIndexById(touches[i].identifier);
			if(idx >= 0) {
				//log("touch finishing "+idx+" on "+ongoingTouches[idx].target.innerHTML);
				ongoingTouches.splice(idx, 1);  // remove it; we're done
			} else {
				log("can't figure out which touch to end");
			}
		}
	}

	function copyTouch(touch) {
		return {
			identifier: touch.identifier,
			target: touch.target,
			pageX: touch.pageX,
			pageY: touch.pageY
		};
	}

	function ongoingTouchIndexById(idToFind) {
		for (var i=0; i < ongoingTouches.length; i++) {
			var id = ongoingTouches[i].identifier;
			
			if (id == idToFind) {
				return i;
			}
		}
		return -1;    // not found
	}
	
})(typeof exports === 'undefined'? this['moving']={}: exports);
