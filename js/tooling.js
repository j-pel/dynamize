/*!
 * tooling.js
 *
 * Copyright © 2016 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/dynamize
 * 
 */

((exports) => {

	'use strict';

	const attach = exports.attach = (element, tools) => tools.map((item)=>element.appendChild(tool(item).element));

	const tool = exports.tool = (options) => {
		const span = document.createElement('span');
		span.classList.add('tool');
		const self = { // Set default values for options
			status: 'active',
			element: span,
			onclick: (evt)=>evt.target.dialog.toggle(),
		};	
		Object.assign(self, options); // replace with custom options
	
		span.title = self.name;
		span.style.background = `no-repeat center/24px url('${self.icon}')`;
		span.appendChild(document.createTextNode("\u00A0"));
		span.dialog = dialog({parent: self});
		span.dialog.element.classList.add("dialog");
		span.dialog.element.id = self.name + "_dlg_"+self.id;
	
		span.onclick = self.onclick;
	
		return self;
	}
	
	const dialog = exports.dialog = (options) => {
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
		div.controller = self;
	
		self.toggle = () => {
			const button = self.parent.element;
			if (self.element.style.display == "block"){
				self.element.style.display = "none";
				button.classList.remove("active");
			} else {
				if (isDirty) self.build(self.parent.widget);
				button.classList.add("active");
				self.element.style.display = "block";
				let top = (button.offsetTop + button.offsetHeight + button.parentElement.offsetTop + button.parentElement.offsetParent.offsetTop);
				let left = (button.offsetLeft + button.parentElement.offsetLeft + button.parentElement.offsetParent.offsetLeft);
				top += ((window.innerHeight - self.parent.height - top)<0) ? window.innerHeight - self.parent.height - top:0;
				left += ((document.body.clientWidth - self.parent.width - left)<0) ? document.body.clientWidth - self.parent.width - left:0;
				self.element.style.top = top + "px";
				self.element.style.left = left + "px";
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
				const btn = document.createElement('div');
				btn.classList.add("close-button");
				btn.onclick = (evt)=>self.toggle();
				div.appendChild(btn);
			}
		}
	
		self.onclick = (evt)=>{
	
		}
	
		return self;
	}
	

})(typeof exports === 'undefined'? this['tooling']={}: exports);
