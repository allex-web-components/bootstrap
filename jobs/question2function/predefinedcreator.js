function createQuestion2PredefinedFunctionJob (lib, mylib) {
  'use strict';
  var Question2FunctionJob = mylib.Question2Function;

  function Question2PredefinedFunctionJob (question, func, options, defer) {
    Question2FunctionJob.call(this, question, func, defer);
    this.options = options;
  }
  lib.inherit(Question2PredefinedFunctionJob, Question2FunctionJob);
  Question2PredefinedFunctionJob.prototype.destroy = function () {
    this.options = null;
    Question2FunctionJob.prototype.destroy.call(this);
  };
  Question2FunctionJob.prototype.title = function () {
    return this.options.title;
  };
  Question2FunctionJob.prototype.createInput = function () {
    return this.options.caption;
  };
  Question2FunctionJob.prototype.okCaption = function () {
    return this.options.ok || 'Yes';
  };
  Question2PredefinedFunctionJob.prototype.argumentArrayForFunction = function () {
    return this.options.params;
  };
  mylib.Predefined = Question2PredefinedFunctionJob;

}
module.exports = createQuestion2PredefinedFunctionJob;