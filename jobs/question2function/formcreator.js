function createFormQuestion2FunctionJob (applib, lib, mylib) {
  'use strict';

  var Question2FunctionJob = mylib.Question2Function;

  function FormQuestion2FunctionJob (question, func, options, defer) {
    Question2FunctionJob.call(this, question, func, defer);
    this.uid = lib.uid();
    this.mydivid = 'formdiv_'+this.uid;
    this.options = options;
    this.form = null;
  }
  lib.inherit(FormQuestion2FunctionJob, Question2FunctionJob);
  FormQuestion2FunctionJob.prototype.destroy = function () {
    if (this.form) {
      this.form.destroy();
    }
    this.form = null;
    this.options = null;
    this.mydivid = null;
    this.uid = null;
    Question2FunctionJob.prototype.destroy.call(this);
  };
  FormQuestion2FunctionJob.prototype.title = function () {
    return this.options.title;
  }
  FormQuestion2FunctionJob.prototype.createInput = function () {
    lib.runNext(this.onInputCreated.bind(this));
    return '<div id="'+this.mydivid+'" style="width:100%; height:100%"></div>';
  };

  FormQuestion2FunctionJob.prototype.onInputCreated = function () {
    var options, ctor;
    if (this.options.form.ctor) {
      options = this.options.form.options || {};
      options.force_dom_parent = '#'+this.mydivid;
      options.actual = true;
      applib.getElementType('BasicElement').createElement({
        name: 'Form',
        type: this.options.form.ctor,
        options: options
      }, this.onFormCreated.bind(this));
    }
  };
  FormQuestion2FunctionJob.prototype.onFormCreated = function (form) {
    this.form = form;
  }


  mylib.Form = FormQuestion2FunctionJob;
}
module.exports = createFormQuestion2FunctionJob;