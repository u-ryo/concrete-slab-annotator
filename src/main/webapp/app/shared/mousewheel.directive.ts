import { Directive, Output, HostListener, EventEmitter } from '@angular/core';

// https://raw.githubusercontent.com/SodhanaLibrary/angular2-examples/master/app/mouseWheelDirective/mousewheel.directive.ts

@Directive({ selector: '[jhiMouseWheel]' })
export class MouseWheelDirective {
  // @Output() mouseWheelUp = new EventEmitter();
  // @Output() mouseWheelDown = new EventEmitter();
  @Output() mouseWheel = new EventEmitter();

  @HostListener('mousewheel', ['$event']) onMouseWheelChrome(event: any) {
    this.mouseWheelFunc(event);
  }

  @HostListener('DOMMouseScroll', ['$event']) onMouseWheelFirefox(event: any) {
    this.mouseWheelFunc(event);
  }

  @HostListener('onmousewheel', ['$event']) onMouseWheelIE(event: any) {
    this.mouseWheelFunc(event);
  }

  mouseWheelFunc(event: any) {
      event = window.event || event; // old IE support
    // let delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
    this.mouseWheel.emit(event);
    // if(delta > 0) {
    //     this.mouseWheelUp.emit(event);
    // } else if(delta < 0) {
    //     this.mouseWheelDown.emit(event);
    // }
    // for IE
    event.returnValue = false;
    // for Chrome and Firefox
    if (event.preventDefault) {
        event.preventDefault();
    }
  }
}
