function createTextInputWithList (execlib, applib, mylib) {
  'use strict';

  var lib = execlib.lib,
    lR = execlib.execSuite.libRegistry,
    applib = lR.get('allex_applib'),
    formwc = execlib.execSuite.libRegistry.get('allex_formwebcomponent'),
    DataHolderMixin = formwc.mixins.DataHolder,
    WebElement = applib.getElementType('WebElement'),
    bufftriglib = execlib.execSuite.libRegistry.get('allex_bufferedtriggerlib'),
    BufferedWaiter = bufftriglib.BufferedWaiter,
    templateslib = lR.get('allex_templateslitelib'),
    htmltemplateslib = lR.get('allex_htmltemplateslib'),
    o = templateslib.override,
    m = htmltemplateslib;

  var _MAX_ITEMS_TO_FILLIN_ASYC = 5;
  var qlib = lib.qlib,
    JobOnDestroyable = qlib.JobOnDestroyable;

  function ListFillerJob (elem, rawitems, start, defer) {
    JobOnDestroyable.call(this, elem, defer);
    this.rawItems = rawitems;
    this.currentIndex = start-1;
  }
  lib.inherit(ListFillerJob, JobOnDestroyable);
  ListFillerJob.prototype.destroy = function () {
    this.currentIndex = null;
    this.rawItems = null;
    JobOnDestroyable.prototype.destroy.call(this);
  };
  ListFillerJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    lib.runNext(this.fillOne.bind(this));
    return ok.val;
  };
  ListFillerJob.prototype.fillOne = function () {
    if (!this.okToProceed()) {
      return;
    }
    if (!lib.isNumber(this.currentIndex)) {
      this.resolve(0);
      return;
    }
    if (!lib.isArray(this.rawItems)) {
      this.resolve(0);
      return;
    }
    if (this.rawItems != this.destroyable.rawItemsToFillIn) {
      this.resolve(this.currentIndex);
      return;
    }
    this.currentIndex++;
    if (this.currentIndex >= this.rawItems.length) {
      this.resolve(this.currentIndex);
      return;
    }
    this.destroyable.optionProducer(this.rawItems[this.currentIndex]);
    lib.runNext(this.fillOne.bind(this));
  };

  function createMarkup (options) {
    options = options || {};
    return o(m.textinput
      , 'CLASS', lib.joinStringsWith('dropdown-toggle', options.class, ' ')
      , 'ATTRS', options.attrs
      , 'CONTENTS', options.contents
    );
  }

  function TextInputWithListElement (id, options) {
    options = options || {};
    options.default_markup = options.default_markup || createMarkup(options.markup);
    WebElement.call(this, id, options);
    DataHolderMixin.call(this, options);
    this.waiter = new BufferedWaiter(this.processWaiter.bind(this), options.input_timeout||0);
    this.clicked = new lib.HookCollection();
    this.dropdown = null;
    this.listContainer = null;
    this.list = null;
    this.rawItemsToFillIn = null;
    this.itemChooser = this.chooseItem.bind(this);
    this.onClickeder = this.onClicked.bind(this);
  }
  lib.inherit(TextInputWithListElement, WebElement);
  DataHolderMixin.addMethods(TextInputWithListElement);
  TextInputWithListElement.prototype.__cleanUp = function () {
    if (this.$element && this.waiter) {
      this.$element.off('keydown', this.waiter.triggerer);
      this.$element.off('show.bs.dropdown', this.onClickeder);
    }
    this.onClickeder = null;
    this.itemChooser = null;
    this.rawItemsToFillIn = null;
    this.list = null;
    this.listContainer = null;
    if (this.dropdown) {
      this.dropdown.dispose();
    }
    this.dropdown = null;
    if(this.clicked) {
       this.clicked.destroy();
    }
    this.clicked = null;
    if (this.waiter) {
      this.waiter.destroy();
    }
    this.waiter = null;
    DataHolderMixin.prototype.destroy.call(this);
    WebElement.prototype.__cleanUp.call(this);
  };
  TextInputWithListElement.prototype.prepareTextInput = function () {
    this.$element.attr('spellcheck', !!this.getConfigVal('spellcheck'));
    this.$element.parent().addClass('dropdown');
    this.$element.addClass('dropdown-toggle');
    this.$element.attr('data-bs-toggle', 'dropdown');
    this.$element.val(this.getConfigVal('value'));
    this.listContainer = jQuery('<div>');
    this.listContainer.addClass('dropdown-menu');
    this.listContainer.css({
      'overflow-y': 'auto',
      'overflow-x': 'hidden',
      'max-height': 200,
      position: 'relative'
    });
    this.list = jQuery('<ul>');
    this.list.css({
      margin: 0,
      'padding-inline-start': 0,
      position: 'relative'
    });
    this.listContainer.append(this.list);
    this.listContainer.insertAfter(this.$element);
    this.dropdown = new bootstrap.Dropdown(this.$element[0], {autoClose:false});
    this.$element.on('keydown', this.waiter.triggerer);
    this.$element.on('show.bs.dropdown', this.onClickeder);
  };
  TextInputWithListElement.prototype.processWaiter = function () {
    if (!(this.$element && this.$element.length>0 && this.needLookup)){
      return;
    }
    this.processTextInput(this.$element.val());
  };
  TextInputWithListElement.prototype.processTextInput = function (val) {};

  TextInputWithListElement.prototype.fillList = function (rawitems, oldlistlength) {
    if (!this.dropdown) {
      return;
    }
    this.clearList();
    this.dropdown.hide();
    listFiller.call(this, lib.isArray(rawitems) ? rawitems : [], oldlistlength);
    //(lib.isArray(rawitems) ? rawitems : []).forEach(this.optionProducer.bind(this)); //dangerously slow for a lot of rawitems
  };
  TextInputWithListElement.prototype.onListFilled = function () {  };
  //static
  function listFiller (items, olditemslength) {
    var i, item, top;
    top = items.length;
    this.rawItemsToFillIn = items;
    if (top>_MAX_ITEMS_TO_FILLIN_ASYC) {
      top = _MAX_ITEMS_TO_FILLIN_ASYC;
    }
    for (i=0; i<top; i++) {
      this.optionProducer(items[i]);
      if (i==olditemslength) {
        this.onListFilled();
      }
    }
    this.jobs.run('.', new ListFillerJob(this, items, i)).then(this.onListFilled.bind(this));
  }
  //static end
  TextInputWithListElement.prototype.optionProducer = function (rawitem) {
    var li = jQuery('<li>');
    li.css({
      'white-space': 'pre'
    });
    //console.log('proposal', prop);
    li.on('click', this.itemChooser);
    li.addClass('dropdown-item');
    this.makeUseOfProducedOption(li, rawitem);
  };
  TextInputWithListElement.prototype.makeUseOfProducedOption = function (li, rawitem) {
    this.visualizeOption(li, rawitem);
    li.attr('data', JSON.stringify(rawitem));
    this.list.append(li);
  };
  TextInputWithListElement.prototype.visualizeOption = function (li, rawitem) {
    li.text(this.rawItemToText(rawitem));
  };
  TextInputWithListElement.prototype.rawItemToText = function (rawitem) {
    return (
      lib.isString(rawitem) ||
      lib.isNumber(rawitem)
    ) ? rawitem+'' : JSON.stringify(rawitem);
  };

  TextInputWithListElement.prototype.clearList = function () {
    if (!this.list) {
      return;
    }
    this.list.find('a').off('click', this.itemChooser);
    this.list.empty();
  };

  TextInputWithListElement.prototype.chooseItem = function (evnt) {
    //console.log(evnt);
    var data, target;
    this.list.find('li').removeClass('active');
    this.dropdown.hide();
    target = evnt.currentTarget || evnt.target;
    if (!target) {
      this.makeUseOfChosenItemData(null);
      return null;
    }
    jQuery(target).addClass('active');
    try {
      data = JSON.parse(target.getAttribute('data'));
      this.makeUseOfChosenItemData(data);
      return target;
    } catch(ignore) {
      console.error('sta sad?', ignore, 'na', target);
      return null;
    }
  };
  TextInputWithListElement.prototype.makeUseOfChosenItemData = function (data) {
    this.set('value', this.rawDataToTextInputValue(data));
  };
  TextInputWithListElement.prototype.rawDataToTextInputValue = function (rawitem) {
    return (
      lib.isString(rawitem) ||
      lib.isNumber(rawitem)
    ) ? rawitem+'' : JSON.stringify(rawitem);
  };

  TextInputWithListElement.prototype.onClicked = function (evnt) {
    this.clicked.fire([evnt, null]); //compatible with ClickableElement
  };

  TextInputWithListElement.prototype.postInitializationMethodNames = TextInputWithListElement.prototype.postInitializationMethodNames.concat(['prepareTextInput']);

  applib.registerElementType('TextInputWithList', TextInputWithListElement);

}
module.exports = createTextInputWithList;