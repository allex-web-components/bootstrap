function createQuestion(execlib, applib, mylib) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q,
    PopUpElement = applib.getElementType('PopUp');

  function QuestionElement(id, options) {
    PopUpElement.call(this, id, options);
  }
  lib.inherit(QuestionElement, PopUpElement);
  QuestionElement.prototype.ask = function (config) {
    var buttons = buttonFactory(this, config);
    this.showElements({
      title: config.title,
      body: mylib.markups.questionBodyCreator(config.caption),
      footer: buttons.generateButtonsMarkup(config.buttons),
      cb: config.onCreated
    });
    return buttons.go();
  };

  function buttonFactory (question, config) {
    if (!config) {
      throw new lib.Error('NULL_CONFIG', 'There is no config for the buttonFactory');
    }
    switch (config.type) {
      case 'YesNo':
        return new YesNoHandler(question, config);
      default:
        throw new lib.Error('UNRECOGNIZED_QUESTION_TYPE', type+' is not a recognized question type');
    }
  }

  var JobOnDestroyable = lib.qlib.JobOnDestroyable;

  function AskHandler (question, config, defer) {
    JobOnDestroyable.call(this, question, defer);
    this.question = question;
    this.config = config || {};
    this.listener = question.attachListener('changed', 'actual', this.onQActual.bind(this));
  }
  lib.inherit(AskHandler, JobOnDestroyable);
  AskHandler.prototype.destroy = function () {
    if (this.listener) {
      this.listener.destroy();
    }
    this.listener = null;
    if (this.question) {
      this.question.set('actual', false);
    }
    this.config = null;
    this.question = null;
    JobOnDestroyable.prototype.destroy.call(this);
  };
  AskHandler.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    this.linkToButtons();
    return ok.val;
  }
  AskHandler.prototype.onQActual = function (act) {
    if (act) {
      return;
    }
    this.resolve(null);
  };
  AskHandler.prototype.generateButtonsMarkup = function (options) {
    return '<div></div>';
  };
  AskHandler.prototype.linkToButtons = function () {

  };
  AskHandler.prototype.resolverWith = function (result) {
    this.resolve(result);
  };

  function YesNoHandler (question, config, defer) {
    AskHandler.call(this, question, config, defer);
    this.yesClicker = this.resolverWith.bind(this, true);
    this.noClicker = this.resolverWith.bind(this, false);
  }
  lib.inherit(YesNoHandler, AskHandler);
  YesNoHandler.prototype.destroy = function () {
    this.question.$element.find('[questionbutton="Yes"]').off('click', this.yesClicker);
    this.question.$element.find('[questionbutton="No"]').off('click', this.noClicker);
    AskHandler.prototype.destroy.call(this);
  };
  YesNoHandler.prototype.generateButtonsMarkup = function (options) {
    return mylib.markups.questionButtonsCreator([{
      primary: true,
      //closer: true,
      attrs: 'questionbutton="Yes"',
      caption: this.config.yes || 'Yes'
    },{
      primary: false,
      //closer: true,
      attrs: 'questionbutton="No"',
      caption: this.config.no || 'No'
    }]);
  };
  YesNoHandler.prototype.linkToButtons = function () {
    this.question.$element.find('[questionbutton="Yes"]').on('click', this.yesClicker);
    this.question.$element.find('[questionbutton="No"]').on('click', this.noClicker);
  };

  applib.registerElementType('Question', QuestionElement);
}
module.exports = createQuestion;
