/*!
 * tooling.js
 *
 * Copyright © 2016 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/dynamize
 * 
 */

((exports) => {

	'use strict';

	const dialogs = {};

	const attach = exports.attach = (element, tools) => Promise.all(tools.map(async (item) => element.appendChild(await tool(item))));

	const tool = exports.tool = async (options) => {
		const span = document.createElement('span');
		span.classList.add('tool');
		const self = { // Set default values for options
			status: 'active',
			element: span,
			onclick: (evt)=>evt.target.dialog.toggle({target:evt.target.dialog, trigger: evt.target}),
		};	
		Object.assign(self, options); // replace with custom options
		span.title = self.name;
		span.style.background = `no-repeat center/24px url('${self.icon}')`;
		span.appendChild(document.createTextNode("\u00A0"));
		span.onclick = self.onclick;
		span.options = self;
		if(self.widget){
			span.dialog = await dialog({button: span});
		}
		return span;
	}
	
	const dialog = exports.dialog = async (options) => {

		const self = { // Set default values for options
			status: 'active',
		};
		Object.assign(self, options); // replace with custom options
		const button = self.button.options;
		const src = button.widget;
		if(!dialogs[src]) {
			const div = document.createElement('div');
			dialogs[src] = div;
			div.id = "dialog_"+Object.keys(dialogs).length;
			div.classList.add('dialog');
			div.style.display = "none";
			div.style.position = "absolute";
			if(button.width) div.style.width = button.width + "px";
			if(button.height) div.style.height = button.height + "px";
			document.body.appendChild(div);
			div.onopen = (evt) => true; // Default event handler. Returning false, prevents opening
			div.onclose = (evt) => true; // Default event handler. Returning false, prevents closing
			div.toggle = (evt) => {
				const dialog = evt.target;
				const button = evt.trigger;
				dialog.options.button = button;
				if (dialog.style.display == "block"){
					if(dialog.onclose({target: dialog, trigger: button})){
						dialog.style.display = "none";
						button.classList.remove("active");
					}
				} else {
					if (dialog.onopen({target:dialog, trigger: button})){
						button.classList.add("active");
						dialog.style.display = "block";
						let obj = button;
						let top = obj.offsetHeight;
						let left = 0;
						while (obj!=document.body){
							top+=obj.offsetTop;
							left+=obj.offsetLeft;
							obj = obj.offsetParent;
						}
						top += ((window.innerHeight - button.height - top)<0) ? window.innerHeight - button.height - top:0;
						left += ((document.body.clientWidth - button.width - left)<0) ? document.body.clientWidth - button.width - left:0;
						dialog.style.top = top + "px";
						dialog.style.left = left + "px";
					};
				}
			};
			const response = await fetch(src);
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
			
		return dialogs[src];
	}
	

})(typeof exports === 'undefined'? this['tooling']={}: exports);
