/*!
 * setup.js
 *
 * Copyright © 2021 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/dynamize
 * 
 */

((exports) => {

	'use strict';

	if (["localhost", "127.0.0.1", "", "::1"].includes(window.location.hostname) ) {
		var _api = "http://localhost:8088/liri/";
		var _cdn = "/res/js/";
	} else {
		var api = "https://api.ideati.co/liri/";
		var _cdn = "https://j-pel.github.io/dynamize/js/";
	}

	Object.defineProperty(exports, 'api', {
		get: () => _api,
		set: (x) => _api = (x.charAt(x.length - 1) === "/")?x:x+"/",
	});

	Object.defineProperty(exports, 'cdn', {
		get: () => _cdn,
		set: (x) => _cdn = (x.charAt(x.length - 1) === "/")?x:x+"/",
	});

	const scripts = document.getElementsByTagName('script');
	const index = scripts.length - 1;
	const myScript = scripts[index];
	const version = myScript.src.replace(/^[^\?]+\??/,'');

	const apiCall = exports.apiCall = async function(endpoint, payload){
		const response = await fetch(_api+endpoint, payload);
		const result = await response.json();
		if(result.status = "success")
			return result.data;
		else
			return {error: result.data};
	};

	const require = exports.require = (script) => new Promise((resolve,reject) => {
		const scripts = document.scripts;
		const a = document.createElement('a');
		a.href = _cdn+script.replace(/^\/+/, '');
		for (var s = 0; s < scripts.length; s++) {
			if (a.href == scripts[s].src) resolve(true);
		}
		const insert = function(contents){
			const head = document.getElementsByTagName("head")[0] || document.documentElement;
			const new_script = document.createElement("script");
			new_script.type = "text/javascript";
			contents.then((text)=>{
				new_script.appendChild( document.createTextNode(text));
				head.insertBefore(new_script, head.firstChild);
				resolve(true);
			});
		}
		fetch(a.href+".js?"+version).then(response => {
			if (response.ok) insert(response.text());
			else fetch(a.href+".min.js?"+version).then(response => {
				if (response.ok) insert(response.text());
				else reject(false);
			}).catch((err) => reject(false));
		}).catch((err) => reject(false));
	});

	const loadLibs = exports.loadLibs = (dependencies) => Promise.all(dependencies.map((lib)=>require('/'+lib)));

})(typeof exports === 'undefined'? this['setup']={}: exports);