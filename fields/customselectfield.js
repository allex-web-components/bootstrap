function createCustomSelectField (lib, lR, applib) {
  'use strict';

  var formlib = lR.get('allex_formwebcomponent');
  var CustomSelectElement = applib.getElementType('CustomSelect');
  var mixins = formlib.mixins,
  FieldBaseMixin = mixins.FieldBase,
  TextFromHashMixin = mixins.TextFromHash,
  DataHolderMixin = mixins.DataHolder;
  
  function CustomSelectFieldElement (id, options) {
    options = options || {};
    options.text_is_value = true;
    CustomSelectElement.call(this, id, options);
    FieldBaseMixin.call(this, options);
    TextFromHashMixin.call(this, options);
    DataHolderMixin.call(this, options);
    this.setValidity();
  }
  lib.inherit(CustomSelectFieldElement, CustomSelectElement);
  FieldBaseMixin.addMethods(CustomSelectElement);
  DataHolderMixin.addMethods(CustomSelectElement);
  TextFromHashMixin.addMethods(CustomSelectElement);
  CustomSelectFieldElement.prototype.__cleanUp = function () {
    DataHolderMixin.prototype.destroy.call(this);
    TextFromHashMixin.prototype.destroy.call(this);
    FieldBaseMixin.prototype.destroy.call(this);
    CustomSelectElement.prototype.__cleanUp.call(this);
  };
  CustomSelectFieldElement.prototype.set_data = function (data) {
    var fieldname, enabledfieldname, optionsfieldname, val;
    fieldname = this.getConfigVal('hashfield');
    enabledfieldname = this.getConfigVal('hashenabledfield');
    optionsfieldname = this.getConfigVal('hashoptionsfield');
    this.setDataReceived();
    if (data) {
      if (fieldname) {
        val = lib.readPropertyFromDotDelimitedString(data, fieldname);
      }
      if (enabledfieldname) {
        this.set('enabled', lib.readPropertyFromDotDelimitedString(data, enabledfieldname));
      }
      if (optionsfieldname) {
        this.set('options', lib.readPropertyFromDotDelimitedString(data, optionsfieldname));
      }
    }
    this.set('value', val);
    return true;
  };
  CustomSelectFieldElement.prototype.set_value = function (val) {
    var ret;
    this.setDataReceived();
    ret = CustomSelectElement.prototype.set_value.call(this, val);
    this.setValidity(val);
    return ret;
  };
  CustomSelectFieldElement.prototype.isValueValid = function (val) {
    if (!this.get('required')) {
      return true;
    }
    return lib.isVal(val);
  };
  CustomSelectFieldElement.prototype.actualEnvironmentDescriptor = function (myname) {
    this.setValidity(this.get('value'));
    return lib.extendWithConcat(CustomSelectElement.prototype.actualEnvironmentDescriptor.call(this, myname)||{}, {
    });
  };
  
  applib.registerElementType('CustomSelectField', CustomSelectFieldElement);
}
module.exports = createCustomSelectField;