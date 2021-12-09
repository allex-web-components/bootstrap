(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function createDataModalElement (lib, applib) {
  'use strict';

  var BSModalDivElement = applib.getElementType('BSModalDivElement');

  function BSDataModalDiv (id, options) {
    BSModalDivElement.call(this, id, options);
    this.data = null;
  }
  lib.inherit(BSDataModalDiv, BSModalDivElement);
  BSDataModalDiv.prototype.onShownBsModal = function (ev) {
    var evdata;
    BSModalDivElement.prototype.onShownBsModal.call(this, ev); //ev is ignored in this call;
    evdata = jQuery(ev.relatedTarget).data(this.getConfigVal('bsdatapropertyname')||'data');
    if (lib.defined(evdata)) {
      this.set('data', evdata);
    }
  };

  applib.registerElementType('BSDataModalDivElement', BSDataModalDiv);
}
module.exports = createDataModalElement;

},{}],2:[function(require,module,exports){
function createElements (execlib, applib, mylib) {
  'use strict';

  require('./modalcreator')(execlib.lib, applib);
  require('./datamodalcreator')(execlib.lib, applib);
	require('./modalformcreator')(execlib, applib);
	require('./popupcreator')(execlib, applib, mylib);
	require('./questioncreator')(execlib, applib, mylib);
}
module.exports = createElements;

},{"./datamodalcreator":1,"./modalcreator":3,"./modalformcreator":4,"./popupcreator":5,"./questioncreator":6}],3:[function(require,module,exports){
function createModalElement (lib, applib) {
  'use strict';

  var DivElement = applib.getElementType('DivElement');

  function findinoptions (options, name, dflt) {
    if (!options) {
      return dflt;
    }
    if ('modal_'+name in options) {
      return options['modal_'+name];
    }
    if (options.modal) {
      if (name in options.modal) {
        return options.modal[name];
      }
    }
    return dflt;
  }

  function BSModalDiv (id, options) {
    DivElement.call(this, id, options);
    this.modalInstance;
    this.modal_backdrop = findinoptions(options, 'backdrop', true);
    this.modal_keyboard = findinoptions(options, 'keyboard', true);
    this.modal_show = findinoptions(options, 'show', true);
  }
  lib.inherit(BSModalDiv, DivElement);
  BSModalDiv.prototype.__cleanUp = function () {
    this.modal_show = null;
    this.modal_keyboard = null;
    this.modal_backdrop = null;
    this.modalInstance = null;
    DivElement.prototype.__cleanUp.call(this);
  };
  BSModalDiv.prototype.showElement = function () {
    if (!this.modalInstance) {
      return;
    }
		/*
    this.$element.modal({
      backdrop: this.modal_backdrop,
      keyboard: this.modal_keyboard,
      show: this.modal_show
    });
		*/
    this.modalInstance.show();
    return; 
  };
  BSModalDiv.prototype.hideElement = function () {
    //this.$element.modal('hide');
    if (!this.modalInstance) {
      return;
    }
    this.modalInstance.hide();
  };
  BSModalDiv.prototype.hookToBSModal = function () {
    if (!this.$element.hasClass('modal')) {
      this.$element.addClass('modal');
    }
    this.modalInstance = new bootstrap.Modal(this.$element, {
      backdrop: this.modal_backdrop,
      keyboard: this.modal_keyboard,
      show: this.modal_show
    });
    this.$element.on('shown.bs.modal', this.onShownBsModal.bind(this));
    this.$element.on('hidden.bs.modal', this.onHiddenBsModal.bind(this));
  };
  BSModalDiv.prototype.onShownBsModal = function () {
    var zindex;
    this.set('actual', true);
    zindex = 1040 + (10 * jQuery('.modal:visible').length);
    this.$element.css('z-index', zindex);
    lib.runNext(this.fixZIndex.bind(this, zindex));
    zindex = null;
  };
  BSModalDiv.prototype.onHiddenBsModal = function (ev) {
    this.set('actual', false);
    if (jQuery('.modal:visible').length) {
      jQuery(document.body).addClass('modal-open');
    }
  };
  BSModalDiv.prototype.fixZIndex = function (zindex) {
    var bd = jQuery('.modal-backdrop').not('.modal-stack').css('z-index', zindex-1),
      bdcss = this.getConfigVal('modal_backdrop_class');
    bd.addClass('modal-stack');
    if (!bdcss) {
      return;
    }
    if (lib.isArray(bdcss)) {
      bdcss.forEach(addClass.bind(null, bd));
      bd = null;
      return;
    }
    addClass(bd, bdcss);
  };
  function addClass (bd, bdcss) {
    bd.addClass(bdcss);
  }
  BSModalDiv.prototype.postInitializationMethodNames = 
    DivElement.prototype.postInitializationMethodNames.concat(['hookToBSModal']);


  applib.registerElementType('BSModalDivElement', BSModalDiv);
}
module.exports = createModalElement;

},{}],4:[function(require,module,exports){
function createModalFormElement (execlib, applib) {
  'use strict';

  var lib = execlib.lib,
    formlib = execlib.execSuite.libRegistry.get('allex_formwebcomponent'),
    BSModalDivElement = applib.getElementType('BSModalDivElement'),
    FormMixin = formlib.mixins.Form;

  function BSModalFormElement (id, options) {
    BSModalDivElement.call(this, id, options);
    FormMixin.call(this, options);
  }
  lib.inherit(BSModalFormElement, BSModalDivElement);
  FormMixin.addMethods(BSModalFormElement);
  BSModalFormElement.prototype.__cleanUp = function () {
    FormMixin.prototype.destroy.call(this);
    BSModalDivElement.prototype.__cleanUp.call(this);
  };

  applib.registerElementType('BSModalFormElement', BSModalFormElement);
}
module.exports = createModalFormElement;

},{}],5:[function(require,module,exports){
function createPopups(execlib, applib, mylib) {
  'use strict';
  var lib = execlib.lib,
    BSModalDivElement = applib.getElementType('BSModalDivElement');

  function PopUpElement (id, options) {
    options = options || {};
    options.div = options.div || {};
    options.div.class = 'modal';
    options.force_dom_parent = 'body';
    if (options.closequestion) {
      if (!options.closequestion.path) {
        throw new lib.Error('NO_QUESTION_PATH', 'No "path" in "closequestion"');
      }
      options.modalmarkup = options.modalmarkup || {};
      options.modalmarkup.nodefaultclose = true;
    }
    options.default_markup = mylib.markups.modalMarkup(options.modalmarkup);
    BSModalDivElement.call(this, id, options);
    this.questionInstance = null;
  }
  lib.inherit(PopUpElement, BSModalDivElement);
  PopUpElement.prototype.__cleanUp = function () {
    this.questionInstance = null;
    BSModalDivElement.prototype.__cleanUp.call(this);
  };
  PopUpElement.prototype.doThejQueryCreation = function () {
    var clsq;
    BSModalDivElement.prototype.doThejQueryCreation.call(this);
    if (this.$element && this.$element.length>0) {
      clsq = this.getConfigVal('closequestion');
      if (clsq) { 
        this.$element.find('[popupelement="Close"]')[0].onclick = this.onWantsToClose.bind(this);
      }
    }
  };
  PopUpElement.prototype.onWantsToClose = function () {
    if (!this.questionInstance) {
      return;
    }
    this.questionInstance.ask(lib.extend({
      type: 'YesNo'
    },this.getConfigVal('closequestion'))).then(this.onCloseDecided.bind(this), lib.dummyFunc);
  };
  PopUpElement.prototype.onCloseDecided = function (res) {
    if (!res){
      return;
    }
    this.hideElement();
  }
  PopUpElement.prototype.showElements = function (obj) {
    obj = obj || {};
    this.setTitle(obj.title);
    this.setBody(obj.body);
    this.setFooter(obj.footer);
    this.set('actual', true);
  };
  PopUpElement.prototype.setTitle = function (title) {
    var titcont = this.$element.find('[popupelement="TitleContainer"]'),
      titel = this.$element.find('[popupelement="Title"]');
    if (!lib.isVal(title)) {
      titcont.hide();
      return;
    }
    titel.show().html(title);
    titcont.show();
  };
  PopUpElement.prototype.setBody = function (body) {
    var bodyel = this.$element.find(PopUpElement.bodyFinder);
    if (!lib.isVal(body)){
      bodyel.hide();
      return;
    }
    bodyel.show().html(body || '');
  };
  PopUpElement.prototype.setFooter = function (footer) {
    var foot = this.$element.find('[popupelement="Footer"]');
    if (!(foot && foot.length>0)) {
      return;
    }
    if (!footer) {
      foot.hide();
      return;
    }
    foot.html(footer);
  };
  PopUpElement.prototype.setQuestionInstance = function (inst) {
    this.questionInstance = inst;
  };
  PopUpElement.prototype.createIntegrationEnvironmentDescriptor = function (myname) {
    var cq = this.getConfigVal('closequestion');
    if (!(cq && cq.path)) {
      return BSModalDivElement.prototype.createIntegrationEnvironmentDescriptor.call(this, myname);
    }
    return {
      logic: [{
        triggers: cq.path+':id',
        references: cq.path,
        handler: this.setQuestionInstance.bind(this)
      }]
    };
  };
  PopUpElement.bodyFinder = '[popupelement="Body"]';

  applib.registerElementType('PopUp', PopUpElement);

  function PopUpWithWidgetElement (id, options) {
    if (!(options && options.widgetdescriptor)) {
      throw new lib.Error('NO_WIDGET_DESCRIPTOR', 'Options for '+this.constructor.name+' must have a "widgetdescriptor"');
    }
    options.widgetdescriptor.options = options.widgetdescriptor.options || {};
    options.widgetdescriptor.options.actual = options.actual;
    options.widgetdescriptor.options.target_on_parent=PopUpElement.bodyFinder;
    options.elements = options.elements || [];
    options.elements.push(options.widgetdescriptor);
    PopUpElement.call(this, id, options);
  }
  lib.inherit(PopUpWithWidgetElement, PopUpElement);
  PopUpWithWidgetElement.prototype.doThejQueryCreation = function () {
    PopUpElement.prototype.doThejQueryCreation.call(this);
    if (this.$element && this.$element.length>0) {
      this.setTitle(this.getConfigVal('title'));
      this.setFooter(this.getConfigVal('footer'));
    }
  };
  PopUpWithWidgetElement.prototype.set_actual = function (act) {
    var ret = PopUpElement.prototype.set_actual.call(this, act), myact;
    if (ret) {
      myact = this.get('actual');
      this.__children.traverse(function (chld) {
        if (chld.id=='CloseQuestion') return;
        chld.set('actual', myact);
      });
      myact = null;
    }
    return ret;
  }

  applib.registerElementType('PopUpWithWidget', PopUpWithWidgetElement);
}
module.exports = createPopups;
},{}],6:[function(require,module,exports){
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
      footer: buttons.generateButtonsMarkup(config.buttons)
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

  function YesNoHandler (question, defer) {
    AskHandler.call(this, question, defer);
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
},{}],7:[function(require,module,exports){
(function (execlib) {
  var lib = execlib.lib,
    lR = execlib.execSuite.libRegistry,
    applib = lR.get('allex_applib'),
    mylib = {};

  mylib.markups = require('./markup')(execlib);
  require('./elements')(execlib, applib, mylib);

  lR.register('allex_bootstrapwebcomponent', mylib);
})(ALLEX)

},{"./elements":2,"./markup":8}],8:[function(require,module,exports){
function createMarkups (execlib) {
  'use strict';
  var lib = execlib.lib,
    lR = execlib.execSuite.libRegistry,
    o = lR.get('allex_templateslitelib').override,
    m = lR.get('allex_htmltemplateslib'),
    mylib = {};

    require('./modal')(lib, o, m, mylib);
    require('./question')(lib, o, m, mylib);

  return mylib;
}
module.exports = createMarkups;
},{"./modal":9,"./question":10}],9:[function(require,module,exports){
function createModalMarkups(lib, o, m, mylib) {
  'use strict';

  function modalMarkup (options) {
    options = options||{};
    return o(m.div,
      'CLASS', 'modal' + (options.class ? ' '+options.class : ''),
      'ATTRS', options.attrs || '',
      'CONTENTS', o(m.div,
        'CLASS', 'modal-dialog',
        'CONTENTS', o(m.div,
          'CLASS', 'modal-content',
          'CONTENTS', [
            o(m.div,
              'CLASS', 'modal-header',
              'ATTRS', 'popupelement="TitleContainer"',
              'CONTENTS', [
                o(m.h5,
                  'CLASS', 'modal-title',
                  'ATTRS', 'popupelement="Title"',
                  'CONTENTS', (options.title || 'Title')
                ),
                o(m.button,
                  'CLASS', 'btn-close',
                  'ATTRS', 'type="button" '+
                    (options.nodefaultclose ? '' : 'data-bs-dismiss="modal"')+
                    ' aria-label="'+(options.closecaption || 'Close')+'" popupelement="Close"'
                )
              ]
            ),
            o(m.div,
              'CLASS', 'modal-body',
              'ATTRS', 'popupelement="Body"',
              'CONTENTS', options.caption || ''
            ),
            o(m.div,
              'CLASS', 'modal-footer',
              'ATTRS', 'popupelement="Footer"',
              'CONTENTS', options.footer || ''
            )
          ]
        )
      )
    );
  }

  mylib.modalMarkup = modalMarkup;
}
module.exports = createModalMarkups;
},{}],10:[function(require,module,exports){
function createQuestionMarkups (lib, o, m, mylib) {
  'use strict';

  function questionBodyCreator (caption) {
    if (!lib.isVal(caption)) {
      return caption;
    }
    return o(m.div,
      'CLASS', 'questionbody',
      'CONTENTS', caption
    );
  }

  function questionButtonsCreator (buttondescriptors) {
    return buttondescriptors.map(function (butdesc) {
      return o(m.div,
        'CLASS', lib.joinStringsWith('btn', butdesc.class, butdesc.primary? 'btn-primary' : 'btn-secondary', ' '),
        'ATTRS', lib.joinStringsWith('type="button"', butdesc.attrs, butdesc.closer ? 'data-bs-dismiss="modal"' : '', ' '),
        'CONTENTS', butdesc.caption
      )
    })
  }

  mylib.questionBodyCreator = questionBodyCreator;
  mylib.questionButtonsCreator = questionButtonsCreator;
}
module.exports = createQuestionMarkups;
},{}]},{},[7]);
