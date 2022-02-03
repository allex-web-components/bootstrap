function createQuestion2FunctionJobBase (lib, mylib) {
  'use strict';

  function Question2FunctionJob (question, func, defer) {
    lib.qlib.JobOnDestroyable.call(this, question, defer);
    this.func = func;
  }
  lib.inherit(Question2FunctionJob, lib.qlib.JobOnDestroyable);
  Question2FunctionJob.prototype.destroy = function () {
    this.func = null;
    lib.qlib.JobOnDestroyable.prototype.destroy.call(this);
  };
  Question2FunctionJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    this.destroyable.ask({
      type: 'YesNo',
      title: this.title(),
      caption: this.createInput(),
      //onCreated: console.log.bind(console, 'created'),
      yes: this.okCaption(),
      no: 'Cancel'
    }).then(
      this.onQuestion.bind(this),
      this.resolve.bind(this, false)
    );
    return ok.val;
  };
  Question2FunctionJob.prototype.onQuestion = function (res) {
    if (!this.okToProceed()) {
      return;
    }
    if (!res) {
      this.resolve(false);
      return;
    }

    lib.qlib.promise2defer(this.func(this.argumentArrayForFunction()), this);
  };
  mylib.Question2Function = Question2FunctionJob;
}
module.exports = createQuestion2FunctionJobBase;