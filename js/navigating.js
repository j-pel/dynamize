/*!
 * navigating.js
 *
 * Copyright © 2020 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/dynamize
 * 
 */

(function(exports) {

  'use strict';
	
	var start;
	
	function changeSel(sibling) {
		if (sibling != null) {
			start.focus();
			start.classList.remove("selcell");
			sibling.focus();
			start = sibling;
			start.classList.add("selcell");
		}
	}

	function onMouseDown(e) {
		start.classList.remove("selcell");
		start = e.target
		start.classList.add("selcell");
	}
	
	function onKeyDown(e) {
		e = e || window.event;
		if (e.keyCode == '38') { // up arrow
			var idx = start.cellIndex;
			var nextrow = start.parentElement.previousElementSibling
			if(nextrow == null) return 0;
			while (nextrow.style.display == "none") {
				var nextrow = nextrow.previousElementSibling;
				if(nextrow == null) return 0;
			}
			var sibling = nextrow.cells[idx];
			changeSel(sibling);
		} else if (e.keyCode == '40') { // down arrow
			var idx = start.cellIndex;
			var nextrow = start.parentElement.nextElementSibling;
			if(nextrow == null) return 0;
			while (nextrow.style.display == "none") {
				var nextrow = nextrow.nextElementSibling;
				if(nextrow == null) return 0;
			}
			var sibling = nextrow.cells[idx];
			changeSel(sibling);
		} else if (e.keyCode == '37') { // left arrow
			var sibling = start.previousElementSibling;
			changeSel(sibling);
		} else if (e.keyCode == '39') { // right arrow
			var sibling = start.nextElementSibling;
			changeSel(sibling);
		}
	}

  var apply = exports.apply = function() {
		window.addEventListener('keydown', onKeyDown, false);
		var elements = document.getElementsByClassName('navigatable');
		for (var i = 0; i < elements.length; i++) {
			elements[0].addEventListener('mousedown', onMouseDown, false);
			if(elements[0].children.length>0){
				start = elements[0].children[0].children[0];
				start.focus();
				start.classList.add("selcell");
			}
		}
	}

})(typeof exports === 'undefined'? this['navigating']={}: exports);
