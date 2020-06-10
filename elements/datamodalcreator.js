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
