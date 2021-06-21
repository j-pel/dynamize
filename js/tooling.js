/*!
 * tooling.js
 *
 * Copyright © 2016 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/dynamize
 * 
 */

((exports) => {

	'use strict';

	// widgets keeps track of loaded widgets to avoid reloading them
	const widgets = {};

	// attach creates a list with one or more tool buttons for a toolbar
	const attach = exports.attach = (element, tools) => Promise.all(tools.map(async (item) => element.appendChild(await tool(item))));

	// tool creates a single tool button that may open a dynamic dialog (widget)
	const tool = exports.tool = async (options) => {
		const span = document.createElement('span');
		span.classList.add('tool');
		const self = { // Set default values for options
			status: 'active',
			size: 24,
			element: span,
			onclick: (evt)=>evt.target.dialog.toggle({target:evt.target.dialog, trigger: evt.target}),
		};	
		Object.assign(self, options); // replace with custom options
		span.title = self.name;
		span.style.background = `no-repeat center/${self.size}px url('${self.icon}')`;
		span.appendChild(document.createTextNode("\u00A0"));
		span.onclick = self.onclick;
		span.options = self;
		if(self.widget){
			span.dialog = await dialog({button: span});
		}
		return span;
	}
	
	// dialog creates a dynamic dialog that is loaded and shown when needed. 
	// A trigger button is mandatory. The button may be a tool button or any other clickable control
	const dialog = exports.dialog = async (options) => {

		const self = { // Set default values for options
			status: 'active',
		};
		Object.assign(self, options); // replace with custom options
		const button = self.button.options;
		const src = button.widget;
		if(!widgets[src]) {
			const div = document.createElement('div');
			widgets[src] = div;
			div.id = "dialog_"+Object.keys(widgets).length;
			div.classList.add('dialog');
			div.style.display = "none";
			div.style.position = "absolute";
 			if(button.width) { 
				if(typeof(button.width)=="number") div.style.width = `${button.width}px`;
				else div.style.width = button.width;
			} else {
				div.style.width = `${button.parentElement.offsetWidth}px`
			}
			if(button.height) {
				if(typeof(button.height)=="number") div.style.height = `${button.height}px`;
				else div.style.height = button.height;
			} else {
				div.style.width = `${button.parentElement.offsetHeight}px`
			}
			if(button.zIndex) {
				if(typeof(button.zIndex)=="number") div.style.zIndex = `${button.zIndex}`;
				else div.style.zIndex = button.zIndex;
			}
			document.body.appendChild(div);
			div.onopen = async (evt) => true; // Default event handler. Returning false, prevents opening
			div.onclose = async (evt) => true; // Default event handler. Returning false, prevents closing
			div.toggle = async (evt) => {
				const dialog = evt.target;
				const button = evt.trigger;
				dialog.options.button = button;
				if (dialog.style.display == "block"){
					button.classList.remove("active");
					const allow = await dialog.onclose({target: dialog, trigger: button});
					if(allow) {
						dialog.style.display = "none";
					}
				} else {
					button.classList.add("active");
					const allow = await dialog.onopen({target: dialog, trigger: button});
					if (allow){
						dialog.style.display = "block";
						let obj = button;
						let top = obj.offsetHeight;
						let left = 0;
						while (obj!=document.body){
							top+=obj.offsetTop;
							left+=obj.offsetLeft;
							obj = obj.offsetParent;
						}
						top += ((window.innerHeight - button.options.height - top)<0) ? window.innerHeight - button.options.height - top+window.scrollY:0;
						left += ((document.body.clientWidth - button.options.width - left)<0) ? document.body.clientWidth - button.options.width - left+window.scrollX:0;
						if (button.options.type=="minimizer") top -= button.offsetHeight;
						dialog.style.top = top + "px";
						dialog.style.left = left + "px";
					};
				}
			};
			const response = await fetch(src, {
				method: 'GET',
				cache: 'no-cache',
				headers: {
					'pragma': 'no-cache',
					'cache-control': 'no-cache',
					'Accept': 'text/html charset=utf-8',
				}
			});
			if(response.ok) {
				const text = await response.text();
				div.innerHTML = text;
				const elem = div.lastElementChild;
				if (elem.nodeName=="SCRIPT") {
					const new_script = document.createElement("script");
					new_script.appendChild(document.createTextNode(div.removeChild(elem).textContent));
					document.body.appendChild(new_script);
				}
			}
			self.element = div;
			div.options = self;
			const btn = document.createElement('div');
			btn.classList.add("close-button");
			btn.onclick = (evt)=>div.toggle({target: div, trigger:div.options.button});
			div.appendChild(btn);
		}
			
		return widgets[src];
	}
	

})(typeof exports === 'undefined'? this['tooling']={}: exports);
