/*!
 * tabset.js
 *
 * Copyright © 2018 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/dynamize
 *
 * UNDER DEVELOPMENT: 
 * May be used for production but not recommended
 *
 */

(function(exports) {

  'use strict';

	exports.tabs = {};
	var tab_panels = {};
	var container = {};

	var init = exports.init = function(parent,tabs) {
		container = parent;
		tab_panels = document.createElement("div");
		tab_panels.classList.add("tab-panels");
		parent.appendChild(tab_panels);
	}

	var insertTab = exports.insertTab = function(title,options) {
		var tab = Object.keys(exports.tabs).length;
		var opt = document.createElement("input");
		opt.type = "radio";
		opt.name = "tabset";
		opt.onclick = function(evt){
			var idx = parseInt(/tab([0-9]*)/.exec(evt.target.id)[1]);
			if (idx!=tabset.sel_tab) {
				var c_evt = new CustomEvent("tabchange",{
					detail: {tab:idx,previous:tabset.sel_tab},
					bubbles: false,
					cancelable: true
				});
				tabset.sel_tab = idx;
				evt.target.parentNode.dispatchEvent(c_evt);
			}
		};
		if (tab==0) { // First tab?
			opt.checked = true;
			exports.sel_tab = 1;
		}
		tab++;
		opt.id = "tab"+tab;
		var lbl = document.createElement("label");
		lbl.htmlFor = "tab"+tab;
		lbl.id = "label"+tab;
		lbl.classList.add(options.className);
		lbl.appendChild(document.createTextNode(title));
		container.insertBefore(opt,tab_panels);
		container.insertBefore(lbl,tab_panels);
		var pnl = document.createElement("section");
		pnl.id = title;
		pnl.classList.add("tab-panel");
		pnl.classList.add(options.className);
		pnl.appendChild(options.panelPainter(title));
		tab_panels.appendChild(pnl);
		exports.tabs[title]=options;
	}
	
	var updateTab = exports.updateTab = function(title) {
		const sct = document.getElementById(title);
		const idx = getTabIndex(title);
		const lbl = document.getElementById("label"+idx);
		sct.replaceChild(this.tabs[title].panelPainter(title),sct.lastChild);
		lbl.classList.add("changed");
	}

	var selectTab = exports.selectTab = function(title) {
		const idx = getTabIndex(title);
		const tab = document.getElementById("tab"+idx);
		tab.click();
	}

	function getTabIndex(title) {
		const tabs = document.getElementsByClassName("tab-panel");
		for(var i=0;i<tabs.length;i++){
			if(tabs[i].id==title) return (i+1);
		}
		return -1;
	}

})(typeof exports === 'undefined'? this['tabset']={}: exports);
