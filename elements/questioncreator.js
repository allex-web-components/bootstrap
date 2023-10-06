function createQuestion(execlib, applib, mylib) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q,
    PopUpElement = applib.getElementType('PopUp');

  function QuestionElement(id, options) {
    options = options || {};
    options.modalmarkup = options.modalmarkup || {};
    options.modalmarkup.nodefaultclose = true;
    PopUpElement.call(this, id, options);
  }
  lib.inherit(QuestionElement, PopUpElement);
  QuestionElement.prototype.ask = function (config) {
    var buttons = buttonFactory(this, config);
    this.showElements({
      title: config.title,
      body: buttons.generateBodyMarkup(),
      footer: buttons.generateButtonsMarkup(),
      cb: config.onCreated
    });
    return buttons.go();
  };
  QuestionElement.prototype.environmentDescriptor_for_OkCancelWithInput = function (myname, okcancelwithinputhandler) {
    var ret = {
      elements: [{
        type: 'ClickableElement',
        name: myname+'.Ok',
        options: {
          actual: true,
          self_selector: 'attrib:questionbutton'
        }
      },{
        type: 'ClickableElement',
        name: myname+'.Cancel',
        options: {
          actual: true,
          self_selector: 'attrib:questionbutton'
        }
      },{
        type: 'TextInputElement',
        name: myname+'.Input',
        options: {
          actual: true,
          self_selector: 'attrib:questioninput'
        }
      }],
      logic: [{
        triggers: 'element.'+myname+':actual',
        references: 'element.'+myname,
        handler: function (me, actual) {
          if (actual) {
            me.$element.find('input').focus();
          }
        }
      },{
        triggers: 'element.'+myname+'.Input:value',
        references: [
          'element.'+myname+'.Ok',
          'element.'+myname+'.Cancel'
        ].join(','),
        handler: okcancelwithinputhandler.onValue.bind(okcancelwithinputhandler)
      },{
        triggers: 'element.'+myname+'.Ok!clicked',
        references: [
          'element.'+myname+'.Input'
        ].join(','),
        handler: okcancelwithinputhandler.onOk.bind(okcancelwithinputhandler)
      },{
        triggers: 'element.'+myname+'.Cancel!clicked',
        handler: okcancelwithinputhandler.onCancel.bind(okcancelwithinputhandler)
      }]
    };
    okcancelwithinputhandler = null;
    return ret;
  };

  function buttonFactory (question, config) {
    if (!config) {
      throw new lib.Error('NULL_CONFIG', 'There is no config for the buttonFactory');
    }
    switch (config.type) {
      case 'YesNo':
        return new YesNoHandler(question, config);
      case 'OkCancelWithInput':
        return new OkCancelWithInputHandler(question, config);
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
  AskHandler.prototype.generateButtonsMarkup = function () {
    return '<div></div>';
  };
  AskHandler.prototype.generateBodyMarkup = function () {
    return mylib.markups.questionBodyCreator(this.config.caption);
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
    if (this.noClicker) {
      this.question.$element.find('[questionbutton="Cancel"]').off('click', this.noClicker);
    }
    this.noClicker = null;
    if (this.yesClicker) {
      this.question.$element.find('[questionbutton="Ok"]').off('click', this.yesClicker);
    }
    this.yesClicker = null;
    AskHandler.prototype.destroy.call(this);
  };
  YesNoHandler.prototype.generateButtonsMarkup = function () {
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


  function OkCancelWithInputHandler (question, config, defer) {
    AskHandler.call(this, question, config, defer);
    this.env = null;
  }
  lib.inherit(OkCancelWithInputHandler, AskHandler);
  OkCancelWithInputHandler.prototype.destroy = function () {
    if (this.env) {
      this.env.destroy();
    }
    AskHandler.prototype.destroy.call(this);
  };
  OkCancelWithInputHandler.prototype.generateBodyMarkup = function () {
    return mylib.markups.questionWithInputBodyCreator(lib.extend({}, this.config, {
      inputattrs: 'questioninput="Input"'
    }));
  };
  OkCancelWithInputHandler.prototype.generateButtonsMarkup = function () {
    return mylib.markups.questionButtonsCreator([{
      primary: true,
      //closer: true,
      attrs: 'questionbutton="Ok"',
      caption: this.config.yes || 'Ok'
    },{
      primary: false,
      //closer: true,
      attrs: 'questionbutton="Cancel"',
      caption: this.config.no || 'Cancel'
    }]);
  };
  OkCancelWithInputHandler.prototype.linkToButtons = function () {
    this.question.loadAdHocEnvironment('OkCancelWithInput', this).then(this.onEnv.bind(this), console.error.bind(console, 'oopsie'));
  };
  OkCancelWithInputHandler.prototype.onEnv = function (env) {
    this.env = env;
  };
  OkCancelWithInputHandler.prototype.onOk = function (input, clickignored) {
    this.resolverWith(input.get('value'));
  };
  OkCancelWithInputHandler.prototype.onCancel = function (clickignored) {
    this.resolverWith(null);
  };
  OkCancelWithInputHandler.prototype.onValue = function (okbutton, cancelbutton, val) {
    if (this.config && this.config.inputregexvalidation) {
      okbutton.set('enabled', this.config.inputregexvalidation.test(val));
    }
  };


  applib.registerElementType('Question', QuestionElement);
}
module.exports = createQuestion;
