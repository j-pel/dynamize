/*!
 * gantting.js
 *
 * Copyright © 2019 Jorge M. Peláez
 * http://j-pel.github.io/dynamize
 *
 * A simple Gantt for small activities with minutes
 * as basis for time control
 * 
 * UNDER DEVELOPMENT:
 * Not recommended for production
 *
 */

function Gantting(viewport){

  'use strict'

  const ns = 'http://www.w3.org/2000/svg'
  var storeChanges = function(changes){return(0)};
  var ongoingTouches = new Array();
  var moving = new Object();
  var touchMoving = false;
  var re = /[-]{0,1}[\d]*[\.]{0,1}[\d]+/g

  var self = {}
  self.parentNode = viewport
  self.tasks = []
  self.svg = document.createElementNS(ns, 'svg')
  self.svg.setAttribute('width', '100%')
  self.svg.setAttribute('height', '100%')
  self.svg.classList.add("gantt")
  viewport.appendChild(self.svg)
  
  /* client API */

  var addTask = self.addTask = function(start,size,text,color,user) {
    if ((typeof(start)==="object")&&(Object.prototype.toString.call(start) != '[object Date]')){
      var size = start.size
      var text = start.text
      var color = start.color
      var user = start.user
      var start = start.start
    }
    if (!color) color='rgba(200,220,250,1)'
    if (!user) user=0
    if (typeof(start)!="number") {
      if (typeof(start)==="string") {
        start = new Date(start)
      }
      if (Object.prototype.toString.call(start) === '[object Date]'){
        if (!self.base) self.base = start
        else if (start<self.base) self.base = start
      }
    }
    self.tasks.push({start:start,size:size,text:text,color:color,user:user})
    return self.tasks.length
  }

  var paint = self.paint = function(scale) {
    if (!scale) scale = 0.2
    var newnode = self.svg.cloneNode(false)
    self.parentNode.replaceChild(newnode, self.svg)
    self.svg = newnode
    if (!color) var color='rgba(180,180,180,1)'
    refresh(scale)
    var bbox = self.svg.getBBox()
    var width = bbox.width+bbox.x+(1440*scale)
    var height = bbox.height+bbox.y
    self.svg.setAttribute("width",width)
    self.svg.setAttribute("height",height)
    var g = document.createElementNS(ns, 'g')
    g.classList.add("grid")
    g.id = "grid1"
    var line = document.createElementNS(ns, 'line')
    line.setAttribute('x1', 0)
    line.setAttribute('y1', 20)
    line.setAttribute('x2', width)
    line.setAttribute('y2', 20)
    line.setAttribute('stroke', 'blue')
    line.setAttribute('stroke-width', '1')
    g.appendChild(line);
    var line = document.createElementNS(ns, 'line')                     
    line.setAttribute('x1', 0)
    line.setAttribute('y1', height)
    line.setAttribute('x2', width)
    line.setAttribute('y2', height)
    line.setAttribute('stroke', 'blue')
    line.setAttribute('stroke-width', '1')
    g.appendChild(line);
    if (self.base) {
      var base = new Date()
      base.setTime(self.base.getTime())
    }
    var day = 0
    for (var i=0; i<width;i+=(360*scale)){
      if (i%(1440*scale)==0) {
        var line = document.createElementNS(ns, 'line')
        line.setAttribute('x1', i)
        line.setAttribute('y1', 0)
        line.setAttribute('x2', i)
        line.setAttribute('y2', height)
        line.setAttribute('stroke', 'rgba(120,220,120,0.8)')
        line.setAttribute('stroke-width', '2')
        g.appendChild(line);
        var element = document.createElementNS(ns, 'text')
        element.setAttribute('x', i+4);
        element.setAttribute('y', 16);
        element.setAttribute('style', 'text-anchor:start; font: 11px verdana; text-align: center;')
        if (self.base) {
          var txt = base.toYMD()
          if (base.getDay()==0) txt += " Domingo"
          var txt = document.createTextNode(txt)
          base.addDays(1)
        } else {
          var txt = document.createTextNode("Día +"+day)
        }
        element.appendChild(txt);
        day++
        g.appendChild(element);
      } else {
        var line = document.createElementNS(ns, 'line')
        line.setAttribute('x1', i)
        line.setAttribute('y1', 20)
        line.setAttribute('x2', i)
        line.setAttribute('y2', height)
        line.setAttribute('stroke', 'rgba(180,180,180,0.5)')
        line.setAttribute('stroke-width', '1')
        g.appendChild(line);
      }
    }
    for (var i=26; i<height;i+=21){
      var line = document.createElementNS(ns, 'line')
      line.setAttribute('x1', 0)
      line.setAttribute('y1', i)
      line.setAttribute('x2', width)
      line.setAttribute('y2', i)
      line.setAttribute('stroke', 'rgba(180,180,180,0.5)')
      line.setAttribute('stroke-width', '1')
      g.appendChild(line);
    }
    self.svg.appendChild(g)
    return g
  }

  /*!
   * init(store)
   * Starts the handling of the proposed feature
   * A default id is assigned to elements with no id given.
   * 
   * @param {store} callback to receive the elements' changes.
   * @api public
   */
  var initMove = self.initMove = function(store) {
    storeChanges = store;
    var elementList = document.getElementsByClassName('movable');
    for (var i = 0; i < elementList.length; i++) {
      var ele = elementList[i];
      ele.addEventListener('mousedown', handleMouseDown, false);
      ele.style.cursor = 'ew-resize';
      if (!ele.id) {
        ele.id = "nn_m_"+i; // for unidentified nodes: important for storing
      }
    }
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener("touchmove", handleTouchMove, true);
    document.addEventListener("touchleave", handleTouchEnd, true);
    document.addEventListener("touchend", handleTouchEnd, true);
    return 0;
  }

  /*!
   * stop()
   * Stops the handling of the proposed feature.
   * 
   * @api public
   */
  var stopMove = self.stopMove = function() {
    var elementList = document.getElementsByClassName('movable');
    for (var i = 0; i < elementList.length; i++) {
      var ele = elementList[i];
      ele.removeEventListener('mousedown', handleMouseDown, false);
      ele.style.cursor = 'auto';
    }
    document.removeEventListener('touchstart', handleTouchStart, false);
    document.removeEventListener("touchmove", handleTouchMove, true);
    document.removeEventListener("touchleave", handleTouchEnd, true);
    document.removeEventListener("touchend", handleTouchEnd, true);
    return 0;
  }

  var initFix = self.initFix = function() {
    var elementList = document.getElementsByClassName('task');
    for (var i = 0; i < elementList.length; i++) {
      var ele = elementList[i];
      ele.addEventListener('mouseup', handleMouseUpFixed, false);
    }
    return 0;
  }

   /* Private helpers */

  function refresh(scale) {
    var cursor = 46
    for (var i=0, n = self.tasks.length; i < n; i++) {
      var size = self.tasks[i].size
      var text = self.tasks[i].text
      var color = self.tasks[i].color
      var start = self.tasks[i].start
      if (Object.prototype.toString.call(start) === '[object Date]') {
        var base = new Date(self.base.toYMD()+"T00:00:00")
        start = (start.getTime()-base.getTime())/60000
      }
      var len = size*scale-5
      if (len<3) len = 3
      var g = document.createElementNS(ns, 'g')
      g.classList.add("task")
      g.classList.add("movable")
      var p = document.createElementNS(ns, 'path')
      p.setAttribute("d", "m 0 0 h "+len+" l 5 -10, -5 -10 h -"+len+" l 5 10 z")
      p.setAttribute("stroke", "black")
      p.setAttribute("stroke-width", 1)  
      p.setAttribute("opacity", 1)
      p.setAttribute("fill", color)
      var element = document.createElementNS(ns, 'title')
      var txt = document.createTextNode("Empieza en "+formatTime(start)+" y se demora "+formatTime(size)+".")
      element.appendChild(txt)
      p.appendChild(element)
      g.appendChild(p)
      var element = document.createElementNS(ns, 'text')
      element.setAttribute('x', 6)
      element.setAttribute('y', -6)
      element.setAttribute('style', 'text-anchor:start; font: 11px verdana; text-align: center;')
      var txt = document.createTextNode(text)
      element.appendChild(txt)
      g.appendChild(element)
      g.setAttribute("transform","translate("+(start*scale)+" "+cursor+")")
      cursor+=21
      g.userData = self.tasks[i].user
      self.svg.appendChild(g)
    }
    g.scrollIntoView(true,{behavior: "smooth"})
  }

  function formatTime(mins) {
    var hr = Math.floor(mins/60)
    var min = Math.floor(mins-(hr*60))
    var dy = hr/24
    var day = Math.floor(dy)
    var hour = Math.floor((dy-day)*24)
    var fmt = ""
    if (day > 0) {
      if (day > 1){
        fmt += day+" días, "
      } else {
        fmt += day+" día, "
      }
    }
    if (hour > 0) {
      if (hour > 1){
        fmt += hour+" horas y "
      } else {
        fmt += hour+" hora y "
      }
    }
    if (min == 1){
      fmt += min+" minuto"
    } else {
      fmt += min+" minutos"
    }
  return fmt
  }

 /* private helpers */

 function log(msg) {
  var p = document.getElementById('status');
  p.innerHTML = msg + "\n" + p.innerHTML;
}

var handleMouseDown = function (event) {
  event = event || window.event;
  moving=this;
  moving.started = true;
  //log("Start moving " + this.innerHTML);
  document.addEventListener("mousemove", handleMouseMove, true);
  document.addEventListener("mouseup", handleMouseUp, true);
  event.preventDefault();
  if (!window.scrollX) {
    moving.mouseX = event.clientX + document.documentElement.scrollLeft + 
      document.body.scrollLeft;
  } else {
    moving.mouseX = event.clientX + window.scrollX;
  }
  moving.startX = event.screenX //moving.offsetLeft;
}

var handleMouseMove = function (event) {
  if (!moving.started) return;
  event = event || window.event;
  if (!window.scrollX) {
    var x = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
  } else {
    var x = event.clientX + window.scrollX;
  }
  x = x + moving.mouseX - moving.startX//+ x - moving.mouseX;

  var t1 = moving.getAttribute("transform")
  var coords = t1.match(re)
  coords[0] = parseInt(coords[0])+x
  moving.setAttribute("transform","translate("+x+" "+coords[1]+")")
  if (moving.firstChild.classList) {
    if (moving.firstChild.classList.contains("top-fixed")) {
      var evt = new CustomEvent("scroll",{detail: {}, bubbles: true, cancelable: true});
      moving.dispatchEvent(evt);
    }
  }
}

var handleMouseUp = function (event) {
  moving.started = false;
  var changes = [];
  if (parseInt(moving.startX) != parseInt(moving.style.left)) {
    changes.push(moving.id+".style.left="+moving.style.left);
  }
  if (parseInt(moving.startY) != parseInt(moving.style.top)) {
    changes.push(moving.id+".style.top="+moving.style.top);
  }
  storeChanges(changes);
  document.removeEventListener("mousemove", handleMouseMove, true);
  document.removeEventListener("mouseup", handleMouseUp, true);
  onTaskSelected(event,moving)
}

var handleMouseUpFixed = function (event) {
  onTaskSelected(event,this)
}

var handleTouchStart = function (event) {
  var touches = event.changedTouches;
  for (var i=0; i < touches.length; i++) {
    if (touches[i].target.classList.contains('movable')) {
      touchMoving = true;
      ongoingTouches.push(copyTouch(touches[i]));
      //log("start touch "+i+ " on " +touches[i].target.innerHTML+" ("+touches[i].pageX+", "+touches[i].pageY+")");
    }
  }
}

var handleTouchMove = function (event) {
  if (!touchMoving) return;
  event.preventDefault();
  var touches = event.changedTouches;
  var x = 0;
  var y = 0;
  for (var i=0; i < touches.length; i++) {
    var idx = ongoingTouchIndexById(touches[i].identifier);
    if(idx >= 0) {
      x = touches[i].pageX - ongoingTouches[idx].pageX;
      y = touches[i].pageY - ongoingTouches[idx].pageY;
      //log("touch moving "+idx+" on "+ongoingTouches[idx].target.innerHTML+" ("+x+", "+y+")");
      ongoingTouches[idx].target.style.left = ongoingTouches[idx].target.offsetLeft + x + "px";
      ongoingTouches[idx].target.style.top = ongoingTouches[idx].target.offsetTop + y + "px";
      ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
    } else {
      log("can't figure out which touch to continue");
    }
  }
}

var handleTouchEnd = function (event) {
  if (!touchMoving) return;
  touchMoving = false;
  event.preventDefault();
  var touches = event.changedTouches;
  for (var i=0; i < touches.length; i++) {
    var idx = ongoingTouchIndexById(touches[i].identifier);
    if(idx >= 0) {
      //log("touch finishing "+idx+" on "+ongoingTouches[idx].target.innerHTML);
      ongoingTouches.splice(idx, 1);  // remove it; we're done
    } else {
      log("can't figure out which touch to end");
    }
  }
}

function copyTouch(touch) {
  return {
    identifier: touch.identifier,
    target: touch.target,
    pageX: touch.pageX,
    pageY: touch.pageY
  };
}

function ongoingTouchIndexById(idToFind) {
  for (var i=0; i < ongoingTouches.length; i++) {
    var id = ongoingTouches[i].identifier;
    
    if (id == idToFind) {
      return i;
    }
  }
  return -1;    // not found
}

  return self

}