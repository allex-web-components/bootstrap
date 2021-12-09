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