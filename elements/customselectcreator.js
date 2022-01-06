function createCustomSelect (execlib, applib, mylib) {
  'use strict';

  var lib = execlib.lib,
    TextInputWithListElement = applib.getElementType('TextInputWithList');
  
  function CustomSelectElement (id, options) {
    TextInputWithListElement.call(this, id, options);
    this.options = null;
    this.selectedValue = null;
  }
  lib.inherit(CustomSelectElement, TextInputWithListElement);
  CustomSelectElement.prototype.__cleanUp = function () {
    this.selectedValue = null;
    this.options = null;
    TextInputWithListElement.prototype.__cleanUp.call(this);
  };
  CustomSelectElement.prototype.rawItemToText = function (rawitem) {
    return rawitem ? rawitem[this.getConfigVal('titlepath')] : '';
  };
  CustomSelectElement.prototype.rawDataToTextInputValue = function (rawitem) {
    this.set('selectedValue', rawitem ? rawitem[this.getConfigVal('valuepath')] : '');
    return this.rawItemToText(rawitem);
  };

  CustomSelectElement.prototype.set_options = function (options) {
    this.options = options;
    this.fillList(options);
    return true;
  };
  CustomSelectElement.prototype.set_selectedValue = function (selval) {
    this.selectedValue = selval;
    this.$element.val('');
    this.list.find('li').each(this.optionForSelectChecker.bind(this, {found: false}));
    return true;
  };
  CustomSelectElement.prototype.optionForSelectChecker = function (foundobj, index, li) {
    var data;
    if (foundobj.found) {
      return;
    }
    try {
      data = JSON.parse(li.getAttribute('data'));
      if (!data) {
        return;
      }
      if (lib.isEqual(data[this.getConfigVal('valuepath')], this.selectedValue)) {
        this.chooseItem({
          target: li
        });
        foundobj.found = true;
      }
    } catch(e) {
      console.error(e);
    }
  };

  CustomSelectElement.prototype.prepareCustomSelect = function () {
    this.$element.on('show.bs.dropdown', this.onDropDownShow.bind(this));
  };
  CustomSelectElement.prototype.onDropDownShow = function (evntignored) {
    this.listContainer.width(this.$element.outerWidth());
  };

  CustomSelectElement.prototype.postInitializationMethodNames = CustomSelectElement.prototype.postInitializationMethodNames.concat(['prepareCustomSelect']);

  applib.registerElementType('CustomSelect', CustomSelectElement);
}
module.exports = createCustomSelect;