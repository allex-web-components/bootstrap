function createModalFormElement (execlib, applib) {
  'use strict';

  var lib = execlib.lib,
    formlib = execlib.execSuite.libRegistry.get('allex_formwebcomponent'),
    BSModalDivElement = applib.getElementType('BSModalDivElement'),
    FormMixin = formlib.mixins.Form;

  function BSModalFormElement (id, options) {
    BSModalDivElement.call(this, id, options);
    FormMixin.call(this, options);
  }
  lib.inherit(BSModalFormElement, BSModalDivElement);
  FormMixin.addMethods(BSModalFormElement);
  BSModalFormElement.prototype.__cleanUp = function () {
    FormMixin.prototype.destroy.call(this);
    BSModalDivElement.prototype.__cleanUp.call(this);
  };
  BSModalFormElement.prototype.actualEnvironmentDescriptor = function (myname) {
    return lib.extendWithConcat(
      BSModalDivElement.prototype.actualEnvironmentDescriptor.call(this, myname)||{}, 
      FormMixin.prototype.actualEnvironmentDescriptor.call(this, myname)||{}, 
      {
      }
    );
  };


  applib.registerElementType('BSModalFormElement', BSModalFormElement);
}
module.exports = createModalFormElement;
