/*!
 * sliding.js
 *
 * Copyright © 2016 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/dynamize
 * 
 * UNDER DEVELOPMENT: Proof of concept
 * May be used for production but not recommended
 * 
 */

(function(exports) {

  var elementList = document.getElementsByClassName('slidable');
  for (var i = 0; i < elementList.length; i++) {
    var ele = elementList[i];
    ele.addEventListener('keydown', handleKeyDown, false);
    ele.style.cursor = 'move';
    if (!ele.id) {
      ele.id = "nn_m_"+i; // for unidentified nodes: important for storing
    }
  }
  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener("touchmove", handleTouchMove, true);
  document.addEventListener("touchleave", handleTouchEnd, true);
  document.addEventListener("touchend", handleTouchEnd, true);

  var handleTouchStart = function (event) {
    var touches = event.changedTouches[0];
    touchstart = [touches.pageX,touches.pageY,new Date().getTime()];
    //event.preventDefault();
  }

  var handleTouchMove = function (event) {
    //event.preventDefault();
  }

  var handleTouchEnd = function (event) {
    var touches = event.changedTouches[0];
    var dist = [
      touches.pageX-touchstart[0],
      touches.pageY-touchstart[1],
      new Date().getTime()-touchstart[2]
    ];
    if ((dist[2]<300)&&(Math.abs(dist[1])<100)) {
      if (dist[0]<-200) prevSlide()
      else if (dist[0]>200) nextSlide();
    }
  }

  function handleKeyDown(event){
    if(document.activeElement.tagName=='INPUT') return 0;
    switch(event.keyCode) {
      case 38:  // Up
      case 40:  // Down
        document.getElementById('month-list').focus();
        break;
      case 33:  // PgUp
      case 37:  // Left
        nextSlide()
        break;
      case 34:  // PgDown
      case 39:  // Right
        prevSlide()
        break;
      default:
        break;
    }
  }

})(typeof exports === 'undefined'? this['sliding']={}: exports);
