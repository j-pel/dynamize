/*!
 * sliding.js
 *
 * Copyright © 2016 Jorge M. Peláez | MIT license
 * http://j-pel.github.io/dynamize
 *
 * UNDER DEVELOPMENT: Proof of concept
 * Not ready for production
 *
 */

(function(exports) {

  var sliders = [];
  var slides = [];
  var curSlide = 0;

  document.addEventListener('keydown', handleKeyDown, false);

  var elementList = document.getElementsByClassName('slidable');
  for (var i = 0; i < elementList.length; i++) {
    var ele = elementList[i];
    sliders.push(ele);
    ele.addEventListener('touchstart', handleTouchStart, false);
    ele.addEventListener('touchmove', handleTouchMove, true);
    ele.addEventListener('touchleave', handleTouchEnd, true);
    ele.addEventListener('touchend', handleTouchEnd, true);
  }

  var appendSlide = exports.appendSlide = function(info) {
    slides.push(info);
    if (curSlide==0) prevSlide();
  }

  var handleTouchStart = function (event) {
    var touches = event.changedTouches[0];
    console.log("Start touch",touches);
    touchstart = [touches.pageX,touches.pageY,new Date().getTime()];
    //event.preventDefault();
  }

  var handleTouchMove = function (event) {
    //event.preventDefault();
  }

  var handleTouchEnd = function (event) {
    var touches = event.changedTouches[0];
    console.log("End touch",touches);
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

  var prevSlide = exports.prevSlide = function() {
    if (curSlide>0) curSlide--;
    for (var s in sliders) {
      var draw = slides[curSlide].draw;
      draw(sliders[s],slides[curSlide]);
    }
  }

  var nextSlide = exports.nextSlide = function() {
    if (curSlide<(slides.length-1)) curSlide++;
    for (var s in sliders) {
      var draw = slides[curSlide].draw;
      draw(sliders[s],slides[curSlide]);
    }
  }

  function handleKeyDown(event){
    if(document.activeElement.tagName=='INPUT') return 0;
    switch(event.keyCode) {
      case 38:  // Up
      case 40:  // Down
        break;
      case 33:  // PgUp
      case 37:  // Left
        prevSlide()
        break;
      case 34:  // PgDown
      case 39:  // Right
        nextSlide()
        break;
      default:
        break;
    }
  }

})(typeof exports === 'undefined'? this['sliding']={}: exports);
