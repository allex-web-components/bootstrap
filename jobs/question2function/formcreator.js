function createFormQuestion2FunctionJob (applib, lib, mylib) {
  'use strict';

  var WebElement = applib.getElementType('WebElement');
  function QuestionFormHolderElement(id, options) {
    WebElement.call(this, id, options);
    this.ok = null;
  }
  lib.inherit(QuestionFormHolderElement, WebElement);
  QuestionFormHolderElement.prototype.__cleanUp = function () {
    this.ok = null;
    WebElement.prototype.__cleanUp.call(this);
  };
  QuestionFormHolderElement.prototype.actualEnvironmentDescriptor = function (myname) {
    return {
      logic: [{
        triggers: 'element.'+myname+'.Form:valid',
        handler: this.onFormValid.bind(this)
      }]
    }
  };

  QuestionFormHolderElement.prototype.onFormValid = function (valid) {
    if (!this.ok) {
      return;
    }
    this.ok.attr('disabled', !valid);
  }
  QuestionFormHolderElement.prototype.prepareHolder = function () {
    this.ok = this.$element.parents('.modal-content').find('[questionbutton="Yes"]');
  };

  QuestionFormHolderElement.prototype.postInitializationMethodNames = WebElement.prototype.postInitializationMethodNames.concat('prepareHolder');

  applib.registerElementType('QuestionFormHolder', QuestionFormHolderElement);

  var Question2FunctionJob = mylib.Question2Function;

  function FormQuestion2FunctionJob (question, func, options, defer) {
    Question2FunctionJob.call(this, question, func, defer);
    this.uid = lib.uid();
    this.mydivid = 'formdiv_'+this.uid;
    this.options = options || {};
    this.form = null;
    this.options.form = this.options.form || {};
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
  FormQuestion2FunctionJob.prototype.argumentArrayForFunction = function () {
    var val = this.destroyable.getElement(this.mydivid+'.Form').get('value');
    return [lib.extend(this.options.hash, val)];
  };

  FormQuestion2FunctionJob.prototype.onInputCreated = function () {
    var options, ctor;
    if (!this.okToProceed()) {
      return;
    }
    if (this.options.form.ctor) {
      options = this.options.form.options || {};
      options.force_dom_parent = '#'+this.mydivid;
      options.actual = true;
      this.destroyable.createElement({
        name: this.mydivid,
        type: 'QuestionFormHolder',
        options: {
          actual: true,
          self_selector: '#',
          elements: [{
            name: 'Form',
            type: this.options.form.ctor,
            options: options
          }]
        }
      });
    }
  };
  FormQuestion2FunctionJob.prototype.onFormCreated = function (form) {
    this.form = form;
  }


  mylib.Form = FormQuestion2FunctionJob;
}
module.exports = createFormQuestion2FunctionJob;