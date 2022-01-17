function createCustomSelect (execlib, applib, mylib) {
  'use strict';

  var lib = execlib.lib,
    jquerylib = execlib.execSuite.libRegistry.get('allex_jqueryelementslib'),
    jqhelpers = jquerylib.helpers,
    TextInputWithListElement = applib.getElementType('TextInputWithList');
  
  function CustomSelectElement (id, options) {
    TextInputWithListElement.call(this, id, options);
    this.options = null;
    this.selectedValue = null;
    this.onDropDownShower = this.onDropDownShow.bind(this);
    this.onDropDownShowner = this.onDropDownShown.bind(this);
    this.onFocuser = this.onFocus.bind(this);
    this.onKeyDowner = this.onKeyDown.bind(this);
    this.onKeyUper = this.onKeyUp.bind(this);
  }
  lib.inherit(CustomSelectElement, TextInputWithListElement);
  CustomSelectElement.prototype.__cleanUp = function () {
    if (this.$element) {
      this.$element.off('shown.bs.dropdown', this.onDropDownShowner);
      this.$element.off('show.bs.dropdown', this.onDropDownShower);
      this.$element.off('focus', this.onFocuser);
      this.$element.off('keydown', this.onKeyDowner);
      this.$element.off('keyup', this.onKeyUper);
    }
    this.onKeyUper = null;
    this.onKeyDowner = null;
    this.onFocuser = null;
    this.selectedValue = null;
    this.options = null;
    TextInputWithListElement.prototype.__cleanUp.call(this);
  };
  CustomSelectElement.prototype.rawItemToText = function (rawitem) {
    var titlefields, titlepath, titlejoiner, ret;
    if (!rawitem) {
      return '';
    }
    titlefields = this.getConfigVal('titlefields');
    if (lib.isArray(titlefields)) {
      titlejoiner = this.getConfigVal('titlejoiner') || ',';
      ret = titlefields.reduce(titleReducer.bind(null, titlejoiner, rawitem), '');
      titlejoiner = null;
      rawitem = null;
      return ret;
    }
    titlepath = this.getConfigVal('titlepath');
    if (!titlepath) {
      return rawitem;
    }
    return rawitem[titlepath];
  };
  CustomSelectElement.prototype.rawDataToTextInputValue = function (rawitem) {
    this.set('selectedValue', rawitem ? rawitem[this.getConfigVal('valuepath')] : '');
    return this.rawItemToText(rawitem);
  };
  CustomSelectElement.prototype.chooseItem = function (evnt) {
    var chosen = TextInputWithListElement.prototype.chooseItem.call(this, evnt);
    if (chosen) {
      this.showAllOptions();
    }
  };
  CustomSelectElement.prototype.scrollInChosenElement = function (chosen) {
    var contst = this.listContainer[0].scrollTop;
    var listtop = this.list.offset().top;
    var chosentop = jQuery(chosen).offset().top;
    this.listContainer[0].scrollTop = chosentop - listtop;
  };

  CustomSelectElement.prototype.set_options = function (options) {
    this.options = options;
    this.fillList(options);
    if (lib.isArray(options) && options.length>0) {
      this.set('selectedValue', options[0][this.getConfigVal('valuepath')]);
    }
    return true;
  };
  CustomSelectElement.prototype.set_selectedValue = function (selval) {
    this.selectedValue = selval;
    this.$element.val('');
    this.chooseItem({
      target: jqhelpers.jQueryPick(
        this.list, 
        'li', 
        optionForValuePicker.bind(this, this.getConfigVal('valuepath'), this.selectedValue)
      )
    })
    ;
    return true;
  };
  function optionForValuePicker (valpath, val, li) {
    var data;
    try {
      data = JSON.parse(li.getAttribute('data'));
      if (!data) {
        return;
      }
      if (lib.isEqual(data[valpath], val)) {
        return true;
      }
    } catch(e) {
      console.error(e);
    }
  };

  CustomSelectElement.prototype.prepareCustomSelect = function () {
    this.$element.on('show.bs.dropdown', this.onDropDownShower);
    this.$element.on('shown.bs.dropdown', this.onDropDownShowner);
    this.$element.on('focus', this.onFocuser);
    this.$element.on('keydown', this.onKeyDowner);
    this.$element.on('keyup', this.onKeyUper);
  };
  CustomSelectElement.prototype.onDropDownShow = function (evntignored) {
    this.listContainer.width(this.$element.outerWidth());
  };
  CustomSelectElement.prototype.onDropDownShown = function (evntignored) {
    var chosen = jqhelpers.jQueryPick(
      this.list, 
      'li', 
      optionForValuePicker.bind(this, this.getConfigVal('valuepath'), this.selectedValue)
    );
    if (chosen) {
      this.scrollInChosenElement(chosen);
    }
  };

  CustomSelectElement.prototype.onFocus = function () {
    this.$element.select();
  };
  CustomSelectElement.prototype.showAllOptions = function () {
    jqhelpers.jQueryForEach(this.list, 'li', function(li) {jQuery(li).show();});
  };
  CustomSelectElement.prototype.onKeyDown = function (evnt) {
  };
  CustomSelectElement.prototype.onKeyUp = function (evnt) {
    var txtval, txtlower;
    if (evnt && evnt.originalEvent && evnt.originalEvent.keyCode==13) {
      this.showAllOptions();
      this.$element.val(this.textThatCorrespondsToValue(this.get('selectedValue')));
      this.$element.select();
      return false;
    }
    txtval = this.$element.val();
    txtlower = txtval.toLowerCase();
    this.hideAllOptionsNotContaining(txtlower);
  };

  CustomSelectElement.prototype.isTextAnOptionText = function (txt) {
    var ret = jqhelpers.jQuerySome(this.list, 'li', optionTextLowerContains.bind(null, txt));
    txt = null;
    return ret;
  };
  function optionTextLowerContains (txt, li) {
    return li.innerHTML.toLowerCase().indexOf(txt)>=0;
  };

  CustomSelectElement.prototype.showAllOptions = function () {
    jqhelpers.jQueryForEach(this.list, 'li:hidden', function (li) {
      jQuery(li).show();
    });
  };
  CustomSelectElement.prototype.hideAllOptionsNotContaining = function (txt) {
    jqhelpers.jQueryForEach(this.list, 'li', liCaseInsensitiveTxtShower.bind(null, txt));
  };
  function liCaseInsensitiveTxtShower (txt, li) {
    jQuery(li)[optionTextLowerContains(txt, li) ? 'show': 'hide']();
  }

  CustomSelectElement.prototype.textThatCorrespondsToValue = function (val) {
    var elem = jqhelpers.jQueryPick(
      this.list,
      'li',
      optionForValuePicker.bind(this, this.getConfigVal('valuepath'), val)
    );
    val = null;
    if (elem) {
      return elem.innerHTML;
    }
    return '';
  };

  //title reducer via titlefields
  function titleReducer (joinerstring, optiondata, result, titleelement) {
    if (!lib.isString(titleelement)) {
      return result;
    }
    return lib.joinStringsWith(result, valueFromColonSplits(optiondata, titleelement.split(':')), joinerstring);
  };

  function valueFromColonSplits (optiondata, splits) {
    var val = optiondata[splits[0]];
    if (splits.length<2) {
      return val+'';
    }
    val = modify(val, splits[1], 'pre');
    val = modify(val, splits[1], 'post');
    return val+'';
  }
  function modify(value, thingy, direction) {
    var intvalue = parseInt(thingy);
    if (!lib.isNumber(intvalue)) {
      return '';
    }
    return modifiers[direction+'pendToLength'](value+'', lib.isNumber(value) ? '0' : ' ', intvalue);
  }
  var modifiers = {
    prependToLength: function (str, thingy, len) {
      while(str.length < len) {
        str = thingy+str;
      }
      return str;
    },
    postpendToLength: function (str, thingy, len) {
      while(str.length < len) {
        str = str+thingy;
      }
      return str;
    }
  };
  //title reducer via titlefields END

  CustomSelectElement.prototype.postInitializationMethodNames = CustomSelectElement.prototype.postInitializationMethodNames.concat(['prepareCustomSelect']);

  applib.registerElementType('CustomSelect', CustomSelectElement);
}
module.exports = createCustomSelect;