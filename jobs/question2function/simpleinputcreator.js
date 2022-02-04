function createSimpleInputQuestion2FunctionJob (lib, mylib) {
  'use strict';

  var ParamQuestion2FunctionJob = mylib.Param;

  function SimpleInputParamQuestion2FunctionJob (question, func, defer) {
    ParamQuestion2FunctionJob.call(this, question, func, defer);
  }
  lib.inherit(SimpleInputParamQuestion2FunctionJob, ParamQuestion2FunctionJob);
  SimpleInputParamQuestion2FunctionJob.prototype.createInput = function () {
    return '<'+this.inputType+' class="form-control" fixquestionelement="'+this.uid+'" value="'+(
      this.initialInputValue()
    )+'"/>';
  };
  mylib.SimpleInput = SimpleInputParamQuestion2FunctionJob;

  function SimpleNumberInputMixin () {

  }
  SimpleNumberInputMixin.prototype.postProcessInput = function (val) {
    val = parseInt(val);
    if (isNaN(val)) {
      return;
    }
    return val;
  };
  SimpleNumberInputMixin.addMethods = function (klass) {
    lib.inheritMethods(klass, SimpleNumberInputMixin
      ,'postProcessInput'
    );
    klass.prototype.inputType = 'input type="number"';
  };
  mylib.mixins.SimpleNumber = SimpleNumberInputMixin;

  

  function SimpleTextAreaParamQuestion2FunctionJob (question, func, defer) {
    ParamQuestion2FunctionJob.call(this, question, func, defer);
  }
  lib.inherit(SimpleTextAreaParamQuestion2FunctionJob, ParamQuestion2FunctionJob);
  SimpleTextAreaParamQuestion2FunctionJob.prototype.createInput = function () {
    return '<textarea class="form-control" fixquestionelement="'+this.uid+'">'+this.initialInputValue()+'</textarea>';
  };
  mylib.SimpleTextArea = SimpleTextAreaParamQuestion2FunctionJob;

}
module.exports = createSimpleInputQuestion2FunctionJob;