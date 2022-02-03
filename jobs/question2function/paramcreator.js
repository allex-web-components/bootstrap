function createParamQuestion2FunctionJob (lib, mylib) {
  'use strict';
  var Question2FunctionJob = mylib.Question2Function;

  function ParamQuestion2FunctionJob (question, func, defer) {
    Question2FunctionJob.call(this, question, func, defer);
    this.uid = lib.uid();
  }
  lib.inherit(ParamQuestion2FunctionJob, Question2FunctionJob);
  ParamQuestion2FunctionJob.prototype.destroy = function () {
    this.uid = null;
    Question2FunctionJob.prototype.destroy.call(this);
  };
  ParamQuestion2FunctionJob.prototype.argumentArrayForFunction = function () {
    var val;
    val = this.destroyable.$element.find('[fixquestionelement="'+this.uid+'"]').val();
    val = this.postProcessInput(val);
    if (!lib.defined(val)) {
      this.resolve(false);
      return;
    }
    return this.parametrizedArgumentArrayForFunction(val);
  };
  ParamQuestion2FunctionJob.prototype.initialInputValue = function () {
    return '';
  };
  ParamQuestion2FunctionJob.prototype.postProcessInput = function (val) {
    return val;
  };
  ParamQuestion2FunctionJob.prototype.parametrizedArgumentArrayForFunction = function (val) {
    return [val];
  };
  mylib.Param = ParamQuestion2FunctionJob;
}
module.exports = createParamQuestion2FunctionJob;