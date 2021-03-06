function createModalElement (lib, applib) {
  'use strict';

  var DivElement = applib.getElementType('DivElement');

  function BSModalDiv (id, options) {
    DivElement.call(this, id, options);
    this.modal_backdrop = options ? (options.modal_backdrop || true) : true;
    this.modal_keyboard = options ? (options.modal_keyboard || true) : true;
    this.modal_show = options ? (options.modal_show || true) : true;
  }
  lib.inherit(BSModalDiv, DivElement);
  BSModalDiv.prototype.showElement = function () {
    this.$element.modal({
      backdrop: this.modal_backdrop,
      keyboard: this.modal_keyboard,
      show: this.modal_show
    });
    return 
  };
  BSModalDiv.prototype.hideElement = function () {
    this.$element.modal('hide');
  };
  BSModalDiv.prototype.hookToBSModal = function () {
    if (!this.$element.hasClass('modal')) {
      this.$element.addClass('modal');
    }
    this.$element.on('shown.bs.modal', this.onShownBsModal.bind(this));
    this.$element.on('hidden.bs.modal', this.onHiddenBsModal.bind(this));
  };
  BSModalDiv.prototype.onShownBsModal = function () {
    var zindex;
    this.set('actual', true);
    zindex = 1040 + (10 * jQuery('.modal:visible').length);
    this.$element.css('z-index', zindex);
    lib.runNext(this.fixZIndex.bind(this, zindex));
    zindex = null;
  };
  BSModalDiv.prototype.onHiddenBsModal = function () {
    this.set('actual', false);
    if (jQuery('.modal:visible').length) {
      jQuery(document.body).addClass('modal-open');
    }
  };
  BSModalDiv.prototype.fixZIndex = function (zindex) {
    var bd = jQuery('.modal-backdrop').not('.modal-stack').css('z-index', zindex-1),
      bdcss = this.getConfigVal('modal_backdrop_class');
    bd.addClass('modal-stack');
    if (!bdcss) {
      return;
    }
    if (lib.isArray(bdcss)) {
      bdcss.forEach(addClass.bind(null, bd));
      bd = null;
      return;
    }
    addClass(bd, bdcss);
  };
  function addClass (bd, bdcss) {
    bd.addClass(bdcss);
  }
  BSModalDiv.prototype.postInitializationMethodNames = 
    DivElement.prototype.postInitializationMethodNames.concat(['hookToBSModal']);


  applib.registerElementType('BSModalDivElement', BSModalDiv);
}
module.exports = createModalElement;
