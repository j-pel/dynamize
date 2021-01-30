/* 
	ComboBox Object 
	http://www.zoonman.com/projects/combobox/

	Copyright (c) 2011, Tkachev Philipp
	All rights reserved.
	BSD License
	
	Modified by Glenn Ko, 2016
	- some fixes/improvements (flickering dropdown box closing/opening issues)
	- more options for varied use cases
*/
ComboBox = function (object_name) {
	// Glenn: 
	this.showAll = false; // optional setting flag to show all entries rather than type-hint search
	this.unfocusOnSelect = true;  //  optional setting flag to unfocus input when select
	var refocused = false;
	
	// Edit element cache 
	this.edit = document.getElementById(object_name);
	// Items Container 
	var ddl = document.getElementById(object_name).parentNode.getElementsByTagName('DIV');
	this.dropdownlist = ddl[0];
	// Current Item
	this.currentitem = null;
	// Current Item Index
	this.currentitemindex = null;
	// Visible Items Count
	this.visiblecount = 0;
	// Closure Object 
	var parobject = this;   
	
	// Picker
	var pick = document.getElementById(object_name).parentNode.getElementsByTagName('SPAN');
	pick[0].onclick =function () {
		//alert(parobject.edit.hasfocus);
		if (parobject.dropdownlist.style.display != "block") {
		
			parobject.edit.focus();
		}
	};
	// Show Items when edit get focus
	this.edit.onfocus = function () {
		parobject.dropdownlist.style.display = 'block';
		refocused = false;
	};
	// Hide Items when edit lost focus
	this.edit.onblur = function () {
		if(allowLoose && !refocused) {
		
		setTimeout(function () {parobject.dropdownlist.style.display = 'none';}, 150);
		}
		refocused = false;
	};
	var allowLoose=true;
	// IE fix
	parobject.dropdownlist.onmousedown = function(event) {
		allowLoose = false;
    return false;
	}
	parobject.dropdownlist.onmouseup = function(event) {
	
		setTimeout(function () {allowLoose = true;}, 150);
    return false;
	}
	// Get Items

	this.listitems = this.dropdownlist.getElementsByTagName('A');
	for (var i=0;i < this.listitems.length; i++) {
		var t = i;
		// Binding Click Event
		this.listitems[i].onclick = function () {
			var upv = this.innerHTML;   
			upv = upv.replace(/\<b\>/ig, '');
			upv = upv.replace(/\<\/b\>/ig, '');
			parobject.edit.value = upv;
			parobject.dropdownlist.style.display = 'none';
			if ( parobject.unfocusOnSelect) parobject.edit.blur();
			else {
				 parobject.edit.focus(); refocused = true;
			}
			return false;
		}
		// Binding OnMouseOver Event
		this.listitems[i].onmouseover = function (e) {
			for (var i=0;i < parobject.listitems.length; i++) {
				if (this == parobject.listitems[i]) {
					if (parobject.currentitem) {
						parobject.currentitem.className = parobject.currentitem.className.replace(/light/g, '')
					}
					parobject.currentitem = parobject.listitems[i];
					parobject.currentitemindex = i;
					parobject.currentitem.className += ' light';
				}
			}
		}
	};
	// Binding OnKeyDown Event
	this.edit.onkeydown = function (e) {
		e = e || window.event;	
		// Move Selection Up
		if (e.keyCode == 38) {
			// up
			var cn =0;
			if (parobject.visiblecount > 0) {
				if (parobject.visiblecount == 1) {
					parobject.currentitemindex = parobject.listitems.length-1;
				};
				do {
					parobject.currentitemindex--;
					cn++;
				} 
				while (parobject.currentitemindex>0 && parobject.listitems[parobject.currentitemindex].style.display == 'none');
				if(parobject.currentitemindex < 0) parobject.currentitemindex = parobject.listitems.length-1;
				
				if (parobject.currentitem) {
					parobject.currentitem.className = parobject.currentitem.className.replace(/light/g, '')
				};
				parobject.currentitem = parobject.listitems[parobject.currentitemindex];
				parobject.currentitem.className += ' light';
				parobject.currentitem.scrollIntoView(false);
			};
			e.cancelBubble = true;
			if (navigator.appName != 'Microsoft Internet Explorer')	{
				e.preventDefault();
				e.stopPropagation();
			}
			return false;
		}
		// Move Selection Down
		else if (e.keyCode == 40){
			// down
			var ic=0;
			if (parobject.visiblecount > 0) {
				do {
					parobject.currentitemindex++;
				}
				while (parobject.currentitemindex < parobject.listitems.length && parobject.listitems[parobject.currentitemindex].style.display == 'none');
				if(parobject.currentitemindex >= parobject.listitems.length) parobject.currentitemindex = 0;
				
				if (parobject.currentitem) {
					parobject.currentitem.className = parobject.currentitem.className.replace(/light/g, '')
				}
				parobject.currentitem = parobject.listitems[parobject.currentitemindex];
				parobject.currentitem.className += ' light';
				parobject.currentitem.scrollIntoView(false);
			}
			e.cancelBubble = true;
			if (navigator.appName != 'Microsoft Internet Explorer')	{
				e.preventDefault();
				e.stopPropagation();
			}
			return false;
		}
		else if (e.keyCode == 13) {  // Glenn: if keycode enter found on dropdown lister, prevent event from propagating up to form (which can trigger submission)
			e.cancelBubble = true;
			if (navigator.appName != 'Microsoft Internet Explorer')	{
				e.preventDefault();
				e.stopPropagation();
			}
			return false;
		}
		
	};
	this.edit.onkeyup = function (e) {
		e = e || window.event;	
		if (e.keyCode == 13) {
			// enter

			if (parobject.visiblecount != 0) {
				var upv = parobject.currentitem.innerHTML;   
				upv = upv .replace(/\<b\>/ig, '');
				upv = upv .replace(/\<\/b\>/ig, '');
				parobject.edit.value = upv;
			};
			parobject.dropdownlist.style.display = 'none';
			if ( parobject.unfocusOnSelect) parobject.edit.blur();
			else {
				 parobject.edit.focus(); refocused = true;
			}
			
			e.cancelBubble = true;
		
			return false;
		}
		else {
			parobject.dropdownlist.style.display = 'block';
			parobject.visiblecount = 0;
			if (parobject.edit.value == '') {
				for (var i=0;i < parobject.listitems.length; i++) {
					parobject.listitems[i].style.display = 'block';
					parobject.visiblecount++;
					var pv = parobject.listitems[i].innerHTML;
					pv = pv.replace(/\<b\>/ig, '');
					parobject.listitems[i].innerHTML = pv.replace(/\<\/b\>/ig, '');
				}
			}
			else {
				var re = new RegExp( '('+parobject.edit.value +')',"i");
				
				var exactMatch =  parobject.edit.value;
				for (var i=0;i < parobject.listitems.length; i++) {
					var pv = parobject.listitems[i].innerHTML;
					pv = pv.replace(/\<b\>/ig, '');
					pv = pv.replace(/\<\/b\>/ig, '');
					if ( parobject.showAll ||  re.test(pv) ) { //true ||
						parobject.listitems[i].style.display = 'block';
						parobject.visiblecount++;
						parobject.listitems[i].innerHTML = pv.replace(re, '<b>$1</b>');
					}
					else {
						// do replacement as well in case later can be visible
						parobject.listitems[i].innerHTML = pv.replace(re, '<b>$1</b>');  
						parobject.listitems[i].style.display = 'none';
					}
				}
				
				// if visible count happens to be zero, show all elements
				if (parobject.visiblecount == 0) {
					
					for (var i=0;i < parobject.listitems.length; i++) {
						parobject.listitems[i].style.display = 'block';
					}
				}
			
			}
		}
	}
	
}

if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(searchElement, fromIndex) {

      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If len is 0, return false.
      if (len === 0) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      var n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }

      // 7. Repeat, while k < len
      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        // c. Increase k by 1. 
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
        k++;
      }

      // 8. Return false
      return false;
    }
  });
}
