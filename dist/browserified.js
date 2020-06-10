(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function createDataModalElement (lib, applib) {
  'use strict';

  var BSModalDivElement = applib.getElementType('BSModalDivElement');

  function BSDataModalDiv (id, options) {
    BSModalDivElement.call(this, id, options);
    this.data = null;
  }
  lib.inherit(BSDataModalDiv, BSModalDivElement);
  BSDataModalDiv.prototype.onShownBsModal = function (ev) {
    var evdata;
    BSModalDivElement.prototype.onShownBsModal.call(this, ev); //ev is ignored in this call;
    evdata = jQuery(ev.relatedTarget).data(this.getConfigVal('bsdatapropertyname')||'data');
    if (lib.defined(evdata)) {
      this.set('data', evdata);
    }
  };

  applib.registerElementType('BSDataModalDivElement', BSDataModalDiv);
}
module.exports = createDataModalElement;

},{}],2:[function(require,module,exports){
function createElements (lib, applib) {
  'use strict';

  require('./modalcreator')(lib, applib);
  require('./datamodalcreator')(lib, applib);
}
module.exports = createElements;

},{"./datamodalcreator":1,"./modalcreator":3}],3:[function(require,module,exports){
function createModalElement (lib, applib) {
  'use strict';

  var DivElement = applib.getElementType('DivElement');

  function BSModalDiv (id, options) {
    DivElement.call(this, id, options);
    this.modal_backdrop = options ? (options.modal_backdrop || true) : true;
    this.modal_keyboard = options ? (options.modal_keyboard || true) : true;;
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
    jQuery('.modal-backdrop').not('.modal-stack').css('z-index', zindex-1).addClass('modal-stack');
  };
  BSModalDiv.prototype.postInitializationMethodNames = 
    DivElement.prototype.postInitializationMethodNames.concat(['hookToBSModal']);


  applib.registerElementType('BSModalDivElement', BSModalDiv);
}
module.exports = createModalElement;

},{}],4:[function(require,module,exports){
(function (execlib) {
  var lib = execlib.lib,
    lR = execlib.execSuite.libRegistry,
    applib = lR.get('allex_applib');

  require('./elements')(lib, applib);
})(ALLEX)

},{"./elements":2}]},{},[4]);
