function createOffCanvasElement (lib, applib) {
  'use strict';

  var DivElement = applib.getElementType('DivElement');

  function OffCanvasElement (id, options) {
    DivElement.call(this, id, options);
  }
  lib.inherit(OffCanvasElement, DivElement);

  OffCanvasElement.prototype.hookToOffScreen = function () {
    if (!this.$element.hasClass('offcanvas')) {
      this.$element.addClass('offcanvas');
    }
    this.$element.on('show.bs.offcanvas', this.onShowOffCanvas.bind(this));
    this.$element.on('hidden.bs.offcanvas', this.onHiddenOffCanvas.bind(this));
  };

  OffCanvasElement.prototype.onShowOffCanvas = function () {
    this.set('actual', true);
  };
  OffCanvasElement.prototype.onHiddenOffCanvas = function () {
    this.set('actual', false);
  };

  OffCanvasElement.prototype.postInitializationMethodNames = 
    DivElement.prototype.postInitializationMethodNames.concat(['hookToOffScreen']);

  applib.registerElementType('OffCanvasElement', OffCanvasElement);
}
module.exports = createOffCanvasElement;