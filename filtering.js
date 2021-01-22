/*!
 * filtering.js
 *
 * Copyright © 2016 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/dynamize
 * 
 */

(function(exports) {

  'use strict';

  var getContents = exports.getContents = function(tbody) {
    var list = [];
    for (var r = 0; r < tbody.rows.length; r++) {
      list[r] = [];
      for (var c = 0; c < tbody.rows[r].cells.length; c++) {
        list[r][c] = tbody.rows[r].cells[c].textContent;
      }
    }
    return list;
  };

	var appendRow = exports.appendRow = function(table, data) {
		var tr = document.createElement("tr");
		table.appendChild(tr);
		for (var c = 0; c < data.length; c++) {
			var td = document.createElement("td");
			td.tabindex = 0;
			tr.appendChild(td);
			const value = (data[c])?data[c]:"";
			td.appendChild(document.createTextNode(value));
		}
    return tr;
  };

  var appendRows = exports.appendRows = function(table,list) {
		return list.map((item)=>appendRow(table, item));
  };

  var filterRows = exports.filterRows = function(header) {
    // When used in conjunction with scrolling.js, the header is split from the table
    // and the original table is retrieved here.
    if (!header.originalTable) {
      var table=header;
    } else {
      var table = header.originalTable;
    }
    var total = 0;
    var filtered = 0;
    for (var b=0; b<table.tBodies.length; b++) {
      total += table.tBodies[b].rows.length;
      for (var r=0; r<table.tBodies[b].rows.length; r++) {
        table.tBodies[b].rows[r].style.display = "table-row";
      }
      for (var c=0; c<header.tHead.rows[0].cells.length; c++) {
        var filter = header.tHead.rows[0].cells[c].children[0].value;
        if (filter!="") {
          var list = [];
          for (var r=0; r<table.tBodies[b].rows.length; r++) {
            if ((table.tBodies[b].rows[r].style.display != "none")) {
              if (!table.tBodies[b].rows[r].cells[c]){
                list.push(["",r]);
              } else {
                list.push([table.tBodies[b].rows[r].cells[c].textContent,r]);
              }
            }
          }
          // This routine filters out rows that do not match the regular expression
          var re = new RegExp(filter,'i');
          list = list.filter(function(item){
            return !re.test(item[0]);
          });
          // This routine hides the rows
          filtered += list.length;
          for (var r=0; r<list.length; r++) {
            table.tBodies[b].rows[list[r][1]].style.display="none";
          }
        }
      }
    }
    var c_evt = new CustomEvent("filtering",{
      detail: {total:total,filtered:filtered},
      bubbles: false,
      cancelable: true
    });
    window.dispatchEvent(c_evt);
    if(!scrolling.refresh){
      var head = header.rows[0].cells;
      var body = table.tBodies[0]
      if (body.rows.length==0) return(0);
      for (var r=0;r<body.rows.length;r++){
        if (body.rows[r].clientHeight>0) break;        
      }
      if (r>=body.rows.length) return(0);
      body = body.rows[r].cells;
      var cols = (body.length<head.length)?head.length:body.length;
      for (var i=0;i<cols;i++) {
        if (!body[i]||!head[i]) break;
        head[i].firstElementChild.style.width = body[i].clientWidth + "px";
        head[i].style.width = body[i].clientWidth + "px";
      }
    } else {
      scrolling.refresh();
    }
  };
	
	var align = exports.align = function(data) {
		var sheet = document.createElement('style')
		var str = "";
		var align = "";
		data.forEach(function(el, index){
			switch (el){
				case "l":
					align = "left"
					break;
				case "c":
					align = "center"
					break;
				default:
					align = "right"
			}
			str += ".filtrable td:nth-child("+(index+1)+") {text-align: "+align+";}";
			str += ".filtrable th:nth-child("+(index+1)+") input {text-align: "+align+";}";
		})
		sheet.innerHTML = str;
		document.body.appendChild(sheet);
	}

  var apply = exports.apply = function() {
		const elements = document.getElementsByClassName('filtrable');
		for (var i = 0; i < elements.length; i++) {
			const table = elements[i];
			const thead = (!table.tHead)?table.originalThead:table.tHead;
			for (var h = 0; h < thead.rows[0].cells.length; h++) {
				const input = document.createElement("input");
				const th = thead.rows[0].cells[h];
				const w = th.offsetWidth;
				input.placeholder = th.textContent;
				th.removeChild(th.firstChild);
				input.classList.add("filter");
				th.appendChild(input);
				input.style.width = w+"px";
				input.onkeyup = function(evt){
					if (evt.key == "ArrowDown") {
						table.focus();
					} else {
						filterRows(evt.target.parentNode.offsetParent);
					}
				};
			}
		}
	}

})(typeof exports === 'undefined'? this['filtering']={}: exports);

