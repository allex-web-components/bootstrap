function createQuestion2FunctionJobs (lib) {
  'use strict';

  var mylib = {mixins:{}};
  function ParamQuestion2FunctionJob (question, func, defer) {
    lib.qlib.JobOnDestroyable.call(this, question, defer);
    this.func = func;
    this.uid = lib.uid();
  }
  lib.inherit(ParamQuestion2FunctionJob, lib.qlib.JobOnDestroyable);
  ParamQuestion2FunctionJob.prototype.destroy = function () {
    this.uid = null;
    this.func = null;
    lib.qlib.JobOnDestroyable.prototype.destroy.call(this);
  };
  ParamQuestion2FunctionJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    this.destroyable.ask({
      type: 'YesNo',
      title: this.title(),
      caption: this.createInput(),
      onCreated: console.log.bind(console, 'created'),
      yes: this.okCaption(),
      no: 'Cancel'
    }).then(
      this.onQuestion.bind(this),
      this.resolve.bind(this, false)
    );
    return ok.val;
  };
  ParamQuestion2FunctionJob.prototype.onQuestion = function (res) {
    var val;
    if (!this.okToProceed()) {
      return;
    }
    if (!res) {
      this.resolve(false);
      return;
    }
    val = this.destroyable.$element.find('[fixquestionelement="'+this.uid+'"]').val();
    val = this.postProcessInput(val);
    if (!lib.defined(val)) {
      this.resolve(false);
      return;
    }
    console.log('ok', res, val);
    lib.qlib.promise2defer(this.func(this.argumentArrayForFunction(val)), this);
  };
  ParamQuestion2FunctionJob.prototype.initialInputValue = function () {
    return '';
  };
  ParamQuestion2FunctionJob.prototype.postProcessInput = function (val) {
    return val;
  };
  ParamQuestion2FunctionJob.prototype.argumentArrayForFunction = function (val) {
    return [val];
  };
  mylib.Param = ParamQuestion2FunctionJob;

  function InputParamQuestion2FunctionJob (question, func, defer) {
    ParamQuestion2FunctionJob.call(this, question, func, defer);
  }
  lib.inherit(InputParamQuestion2FunctionJob, ParamQuestion2FunctionJob);
  InputParamQuestion2FunctionJob.prototype.createInput = function () {
    return '<'+this.inputType+' fixquestionelement="'+this.uid+'" value="'+(
      this.initialInputValue()
    )+'"/>';
  };
  mylib.Input = InputParamQuestion2FunctionJob;

  function NumberInputMixin () {

  }
  NumberInputMixin.prototype.postProcessInput = function (val) {
    val = parseInt(val);
    if (isNaN(val)) {
      return;
    }
    return val;
  };
  NumberInputMixin.addMethods = function (klass) {
    lib.inheritMethods(klass, NumberInputMixin
      ,'postProcessInput'
    );
    klass.prototype.inputType = 'input type="number"';
  };
  mylib.mixins.Number = NumberInputMixin;

  function TextAreaParamQuestion2FunctionJob (question, func, defer) {
    ParamQuestion2FunctionJob.call(this, question, func, defer);
  }
  lib.inherit(TextAreaParamQuestion2FunctionJob, ParamQuestion2FunctionJob);
  TextAreaParamQuestion2FunctionJob.prototype.createInput = function () {
    return '<textarea fixquestionelement="'+this.uid+'">'+this.initialInputValue()+'</textarea>';
  };
  mylib.TextArea = TextAreaParamQuestion2FunctionJob;

  return mylib;
}
module.exports = createQuestion2FunctionJobs;