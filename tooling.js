/*!
 * tooling.js
 *
 * Copyright © 2016 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/dynamize
 * 
 */

(function(exports) {

	'use strict';

	const attach = exports.attach = function(element, tools) {
		tools.map((item)=>{
			element.appendChild(tool(item).element);
		});
	}

	const tool = function(options) {
		const span = document.createElement('span');
		span.classList.add('tool');
		const self = { // Set default values for options
			status: 'active',
			element: span,
			onclick: (evt)=>{
				evt.target.dialog.toggle();
			}
		};	
		Object.assign(self, options); // replace with custom options
	
		span.style.background = `no-repeat center/24px url('${self.icon}')`;
		span.appendChild(document.createTextNode("\u00A0"));
		span.dialog = dialog({parent: self});
		span.dialog.element.classList.add("dialog");
		span.dialog.element.id = self.name + "_dialog";
	
		span.onclick = self.onclick;
	
	
		return self;
	}
	
	const dialog = function(options) {
		let isDirty = true;
		const div = document.createElement('div');
		div.classList.add('dialog');
		div.style.display = "none";
		document.body.appendChild(div);
	
		const self = { // Set default values for options
			element: div,
			status: 'active',
		};
		Object.assign(self, options); // replace with custom options
	
		self.toggle = ()=>{
			const button = self.parent.element;
			if (self.element.style.display == "block"){
				self.element.style.display = "none";
				button.classList.remove("active");
			} else {
				if (isDirty) self.build(self.parent.widget);
				button.classList.add("active");
				self.element.style.display = "block";
				self.element.style.top = (button.offsetTop + button.offsetHeight + button.parentElement.offsetTop + button.parentElement.offsetParent.offsetTop) + "px";
				self.element.style.left = (button.offsetLeft + button.parentElement.offsetLeft + button.parentElement.offsetParent.offsetLeft) + "px";
				//const inp = self.dialog.getElementsByTagName("input");
				//if(inp.length>0) inp[0].focus();
			}
		};
		
		self.build = async(src) => {
			const response = await fetch(src);
			if(response.ok) {
				const text = await response.text();
				self.element.style.position = "absolute";
				if(self.parent.width) self.element.style.width = self.parent.width + "px";
				if(self.parent.height) self.element.style.height = self.parent.height + "px";
				self.element.innerHTML = text;
				const elem = self.element.lastElementChild;
				if (elem.nodeName=="SCRIPT") {
					const new_script = document.createElement("script");
					new_script.appendChild(document.createTextNode(elem.textContent));
					document.body.appendChild(new_script);
				}
				const btn = document.createElement('img');
				btn.src = '/res/gui/close.png';
				btn.style.position = "absolute";
				btn.style.position = "block";
				btn.style.top = "8px";
				btn.style.right = "8px";
				btn.style.width = "24px";
				btn.style.height = "24px";
				btn.onclick = (evt)=>self.toggle();
				div.appendChild(btn);
			}
		}
	
		self.onclick = (evt)=>{
	
		}
	
		return self;
	}
	

})(typeof exports === 'undefined'? this['tooling']={}: exports);
