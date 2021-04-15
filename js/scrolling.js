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
	const refresh = exports.refresh = function() {
		const elements = document.getElementsByClassName('top-fixed');
		for (var e = 0; e < elements.length; e++) {
			try {
				const head = elements[e].rows[0].cells;
				const body = elements[e].parentNode.originalTable.tBodies[0].firstElementChild.children;
				const cols = (body.length<head.length)?head.length:body.length;
				for (var c=0; c<cols; c++) {
					if (!body[c]||!head[c]) break;
					//const wid = (body[c].clientWidth<head[c].clientWidth)?head[c].clientWidth:body[c].clientWidth;
					const wid = body[c].clientWidth-2;
					if(head[c].firstElementChild) // text input element (ie. filtering textbox)
						head[c].firstElementChild.style.width = parseInt(wid-13) + "px";
					head[c].style.maxWidth = wid + "px";
					head[c].style.minWidth = wid + "px";
					head[c].style.textOverflow = "ellipsis";
					head[c].style.overflow = "hidden";
					head[c].style.textAlign = body[c].style.textAlign;
				}
			}catch(err){
				//debugger
				//console.log("Scrolling refresh error: ", e, err);
			}
		}
	}

	/*
	 * Private utils to modify the DOM in order to create the fixed headers
	 */

	const apply = exports.apply = function() {
		const elements = document.getElementsByClassName('scrollable');
		for (var e = 0; e < elements.length; e++) {
			const table = elements[e];
			const thead = elements[e].tHead;
			if(thead) {
				const page = table.parentNode
				const header = document.createElement("table");
				const hscroller = document.createElement("div");
				const vscroller = document.createElement("div");
				page.appendChild(hscroller);
				header.originalTable = table;
				table.originalThead = thead;
				thead.classList.add('top-fixed');
				table.removeChild(thead);
				header.appendChild(thead);
				hscroller.appendChild(header);
				hscroller.appendChild(vscroller);
				page.removeChild(table);
				vscroller.appendChild(table);
				hscroller.style.width = "fit-content";
				vscroller.style.width = "fit-content";
				vscroller.style.height = (page.offsetHeight - vscroller.offsetTop)+"px";
				vscroller.style.overflow = "scroll";
				page.style.overflow = "scroll";
				["movable","rotable","sizable"].map((cls)=>{
					if(table.classList.contains(cls)) {
						page.classList.add(cls);
						table.classList.remove(cls);
					}
				});
				/*
				hscroller.style.display = "block";
				["width","maxWidth","minWidth","left","right"].map((prop)=>{
					headert.style[prop] = table.style[prop];
				});
				["position","width","height","maxWidth","maxHeight","minWidth","minHeight",
				"top","left","bottom","right"].map((prop)=>{
					vscroller.style[prop] = table.style[prop];
				});
				*/
			}
		}
		// Table is probably empty right now
		//refresh();
	}

	const elements = document.getElementsByClassName('fix-top');
	for (var e = elements.length-1; elements.length > 0;e = elements.length-1) {
		const thead = elements[e];
		const table = elements[e].parentNode;
		const head = elements[e].cloneNode(true);
		//table.removeChild(thead);
		const theadt = document.createElement("table");
		theadt.appendChild(thead);
		head.classList.remove('fix-top');
		const fixed = table.parentNode.insertBefore(document.createElement("table"),table);
		fixed.classList.add('top-fixed');
		fixed.appendChild(head);
		fixed.style.position = "sticky";
		fixed.style.top = "0px";
		fixed.style.width = "100%";
		//table.removeChild(thead);
		//table.removeChild(elements[i]);
	}
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
