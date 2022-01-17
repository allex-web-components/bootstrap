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

  function createMarkup (options) {
    return o(m.textinput);
  }

  function TextInputWithListElement (id, options) {
    options = options || {};
    options.default_markup = options.default_markup || createMarkup(options);
    WebElement.call(this, id, options);
    DataHolderMixin.call(this, options);
    this.waiter = new BufferedWaiter(this.processWaiter.bind(this), options.input_timeout||0);
    this.dropdown = null;
    this.listContainer = null;
    this.list = null;
    this.itemChooser = this.chooseItem.bind(this);
  }
  lib.inherit(TextInputWithListElement, WebElement);
  DataHolderMixin.addMethods(TextInputWithListElement);
  TextInputWithListElement.prototype.__cleanUp = function () {
    this.itemChooser = null;
    this.list = null;
    this.listContainer = null;
    if (this.dropdown) {
      this.dropdown.dispose();
    }
    this.dropdown = null;
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
  };
  TextInputWithListElement.prototype.processWaiter = function () {
    if (!(this.$element && this.$element.length>0 && this.needLookup)){
      return;
    }
    this.processTextInput(this.$element.val());
  };
  TextInputWithListElement.prototype.processTextInput = function (val) {};

  TextInputWithListElement.prototype.fillList = function (rawitems) {
    this.clearList();
    this.dropdown.hide();
    (lib.isArray(rawitems) ? rawitems : []).forEach(this.itemAppender.bind(this));
  };
  TextInputWithListElement.prototype.itemAppender = function (rawitem) {
    var li = jQuery('<li>');
    //console.log('proposal', prop);
    li.text(this.rawItemToText(rawitem));
    li.attr('data', JSON.stringify(rawitem));
    li.on('click', this.itemChooser);
    li.addClass('dropdown-item');
    this.list.append(li);
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
    var data;
    this.list.find('li').removeClass('active');
    this.dropdown.hide();
    if (!evnt.target) {
      return null;
    }
    jQuery(evnt.target).addClass('active');
    try {
      data = JSON.parse(evnt.target.getAttribute('data'));
      this.set('value', this.rawDataToTextInputValue(data));
      return evnt.target;
    } catch(ignore) {
      //console.error('sta sad?', ignore, 'na', evnt.target);
      return null;
    }
  };
  TextInputWithListElement.prototype.rawDataToTextInputValue = function (rawitem) {
    return (
      lib.isString(rawitem) ||
      lib.isNumber(rawitem)
    ) ? rawitem+'' : JSON.stringify(rawitem);
  };

  TextInputWithListElement.prototype.postInitializationMethodNames = TextInputWithListElement.prototype.postInitializationMethodNames.concat(['prepareTextInput']);

  applib.registerElementType('TextInputWithList', TextInputWithListElement);

}
module.exports = createTextInputWithList;