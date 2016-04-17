/*!
 * editing.js
 *
 * Copyright © 2016 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/dynamize
 * 
 */

(function(exports) {

  'use strict';
	
	/* properties */
	var caret = undefined;
	var caretPos = [0,0];
	var rows = 3;
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
		var elementList = document.getElementsByClassName('editable');
		for (var i = 0; i < elementList.length; i++) {
			var ele = elementList[i];
			caret = document.createElement("div");
			caret.classList.add("caret");
			ele.appendChild(caret);
			caret.style.top = ele.offsetTop + "px";
			caret.style.left = ele.offsetLeft + "px";
		}
		refresh();
		window.addEventListener('keydown', keydownHandler, false);
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
		}
		window.removeEventListener('keydown', keydownHandler, false);
		return 0;
	}

	/* private helpers */

	function keydownHandler(event){
    switch(event.keyCode) {
			case 38:  // Up
				if (caretPos[1] > 0) caretPos[1]--;
				break;
			case 40:  // Down
				caretPos[1] +=1;
				break;
			case 33:  // PgUp
			case 37:  // Left
				if (caretPos[0] > 0) {
					caretPos[0]--
				} else {
					if (caretPos[1] > 0) {
						caretPos[1]--
						caretPos[0] = 40;
					}
				}
				break;
			case 34:  // PgDown
			case 39:  // Right
				caretPos[0] +=1;
				break;
/*          default:
				alert(event.keyCode);
				break;
*/  	}
			refresh();
	}

	function scrollHandler(event){
	}

	function refresh() {
		caret.style.left = caret.parentNode.offsetLeft + caretPos[0] * 7 + 1 + "px";
		caret.style.top = caret.parentNode.offsetTop + caretPos[1] * 14 + "px";
		document.getElementById("pos").innerHTML = caretPos[0] + ", " + caretPos[1];
	}
	
})(typeof exports === 'undefined'? this['editing']={}: exports);
