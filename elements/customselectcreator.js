function createCustomSelect (execlib, applib, mylib) {
  'use strict';

  var lib = execlib.lib,
    jquerylib = execlib.execSuite.libRegistry.get('allex_jqueryelementslib'),
    jqhelpers = jquerylib.helpers,
    TextInputWithListElement = applib.getElementType('TextInputWithList');

  function CustomSelectElement (id, options) {
    options = options || {};
    TextInputWithListElement.call(this, id, options);
    this.options = (lib.isArray(options.options)) ? options.options : null;
    this.value = null;
    this.selectedRawItem = null;
    this.itemFoundFromExistingValue = null;
    this.optionMap = new lib.Map();
    this.onDropDownShower = this.onDropDownShow.bind(this);
    this.onDropDownShowner = this.onDropDownShown.bind(this);
    this.onDropDownHider = this.onDropDownHide.bind(this);
    this.onDropDownHiddener = this.onDropDownHidden.bind(this);
    this.onKeyUper = this.onKeyUp.bind(this);

    this.value0 = null;
    this.value1 = null;
    this.value2 = null;
    this.value3 = null;

    //seems like a logical default
    this.setConfigVal('resetvalueonnewoptions', this.getConfigVal('resetvalueonnewoptions') || 'firstnew', true);
  }
  lib.inherit(CustomSelectElement, TextInputWithListElement);
  CustomSelectElement.prototype.__cleanUp = function () {
    if (this.$element) {
      this.$element.off('shown.bs.dropdown', this.onDropDownShowner);
      this.$element.off('show.bs.dropdown', this.onDropDownShower);
      this.$element.off('hide.bs.dropdown', this.onDropDownHider);
      this.$element.off('hidden.bs.dropdown', this.onDropDownHiddener);
      this.$element.off('keyup', this.onKeyUper);
    }
    this.value3 = null;
    this.value2 = null;
    this.value1 = null;
    this.value0 = null;
    this.onKeyUper = null;
    this.onDropDownHiddener = null;
    this.onDropDownHider = null;
    this.onDropDownShowner = null;
    this.onDropDownShower = null;
    if (this.optionMap) {
      this.optionMap.destroy();
    }
    this.optionMap = null;
    this.itemFoundFromExistingValue = null;
    this.selectedRawItem = null;
    this.value = null;
    this.options = null;
    TextInputWithListElement.prototype.__cleanUp.call(this);
  };
  CustomSelectElement.prototype.set_htmlvalue = function (val) {
    return TextInputWithListElement.prototype.set_value.call(this, val);
  };
  CustomSelectElement.prototype.get_htmlvalue = function () {
    return TextInputWithListElement.prototype.get_value.call(this);
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
    this.selectedRawItem = rawitem;
    this.set('value', valueOfData(rawitem, '', this.getConfigVal('valuepath')));
    return this.rawItemToText(rawitem);
  };
  CustomSelectElement.prototype.makeUpOption = function (desc, rawitem) {
    var id = lib.uid();
    desc.contents = this.rawItemToText(rawitem);
    desc.attrib.data = JSON.stringify(id);
  };
  CustomSelectElement.prototype.handleProducedOption = function (rawitems, index, li) {
    var id, txt, val, option, rawitem;
    TextInputWithListElement.prototype.handleProducedOption.call(this, rawitems, index, li);
    rawitem = rawitems[index];
    txt = this.rawItemToText(rawitem);
    val = valueOfData(rawitem, void 0, this.getConfigVal('valuepath'));
    id = JSON.parse(li.getAttribute('data'));
    option = {
      li: li,
      data: rawitem,
      value: val
    };
    this.optionMap.add(id, option);
    if (this.get('value') === val) {
      this.itemFoundFromExistingValue = option;
      this.set('htmlvalue', txt);
    }
  };
  CustomSelectElement.prototype.makeUseOfProducedOption = function (li, rawitem) {
    var id = lib.uid(), txt, val, option;
    txt = this.rawItemToText(rawitem);
    val = valueOfData(rawitem, void 0, this.getConfigVal('valuepath'));
    //li.text(txt);
    this.visualizeOption(li, rawitem);
    li.attr('data', JSON.stringify(id));
    option = {
      li: li,
      data: rawitem,
      value: val
    };
    this.optionMap.add(id, option);
    this.list.append(li);
    if (this.get('value') === val) {
      this.itemFoundFromExistingValue = option;
      this.set('htmlvalue', txt);
    }
  };
  CustomSelectElement.prototype.makeUseOfChosenItemData = function (data) {
    //data is actually id
    this.selectedRawItem = null;
    if (!this.optionMap) {
      return;
    }
    var optdata = this.optionMap.get(data);
    if (!optdata) {
      return;
    }
    if (this.id == 'From') {
      console.log('htmlvalue will be', this.rawDataToTextInputValue(optdata.data));
    }
    this.set('htmlvalue', this.rawDataToTextInputValue(optdata.data));
    optdata.li.classList.add('active');
  };
  CustomSelectElement.prototype.chooseItem = function (evnt) {
    return TextInputWithListElement.prototype.chooseItem.call(this, evnt);
  };
  function setValueFirstNew () {
    if (!this.itemFoundFromExistingValue) {
      //console.log('item not found from', this.get('options'));
      setValueFirst.call(this);
    }
  }
  function setValueFirst () {
    var options = this.get('options');
    if (this.id == 'From') {
      console.log('value will be', (lib.isArray(options) && options.length>0) ? valueOfData(options[0], void 0, this.getConfigVal('valuepath')) : null);
    }
    this.set('value', (lib.isArray(options) && options.length>0) ? valueOfData(options[0], void 0, this.getConfigVal('valuepath')) : null);
  }
  function setValueFirstIfNotVal () {
    var options = this.get('options');
    if (!(lib.isArray(options) && options.length>0)) {
      this.set('value', null);
      return;
    }
    if (!lib.isVal(this.get('value'))) {
      setValueFirst.call(this);
    }
  }
  function setValueNone () {
    this.set('value', null);
  }
  function setValueKeep () {
    if (this.itemFoundFromExistingValue && this.itemFoundFromExistingValue.li) {
      this.itemFoundFromExistingValue.li.classList.add('active');
    }
  }
  CustomSelectElement.prototype.onListFilled = function () {
    var options;
    switch (this.getConfigVal('resetvalueonnewoptions')) {
      case 'firstnew':
        setValueFirstNew.call(this);
        break;
      case 'first':
        setValueFirst.call(this);
        break;
      case 'firstifnotval':
        setValueFirstIfNotVal.call(this);
        break;
      case 'none':
        setValueNone.call(this);
        break;
      case 'keep':
      default:
        setValueKeep.call(this);
        break;
    }
    this.chooseItem({
      target: this.optionThatCorrespondsToValue(this.value)
    });
    if (this.getConfigVal('focusonnewoptions')) {
      this.$element.prop('disabled', false);
      this.$element.trigger('focus');
    }
  };

  CustomSelectElement.prototype.set_options = function (options) {
    var val, oldoptions;
    /*
    var optssame = lib.isEqual(options, this.options);
    if (optssame) {
      //return true;
    }
    */
    oldoptions = this.options||[];
    if (this.optionMap) {
      this.optionMap.purge();
    }
    this.options = options;
    this.itemFoundFromExistingValue = null;
    this.fillList(options, oldoptions.length);
    return true;
  };
  CustomSelectElement.prototype.get_value = function () {
    return this.value;
  };
  CustomSelectElement.prototype.set_value = function (selval) {
    if (!this.$element) {
      return;
    }
    this.value = selval;
    this.$element.val('');
    this.chooseItem({
      target: this.optionThatCorrespondsToValue(this.value)
    });
    /*
    lib.runNext(setArrayValues.bind(this, selval));
    selval = null;
    */
    setArrayValues.call(this, selval);
    return true;
  };

  //static
  function setArrayValues (selval) {
    var split, i;
    if (lib.isArray(this.getConfigVal('valuepath')) && lib.isString(selval)) {
      split = JSON.parse(selval);
      for (i=0; i<4; i++) {
        this.set('value'+i, split.length<=i ? null : split[i]);
      }
      return;
    }
    this.set('value0', null);
    this.set('value1', null);
    this.set('value2', null);
    this.set('value3', null);
  }
  //endofstatic

  CustomSelectElement.prototype.prepareCustomSelect = function () {
    this.$element.on('show.bs.dropdown', this.onDropDownShower);
    this.$element.on('shown.bs.dropdown', this.onDropDownShowner);
    this.$element.on('hide.bs.dropdown', this.onDropDownHider);
    this.$element.on('hidden.bs.dropdown', this.onDropDownHiddener);
    this.$element.on('keyup', this.onKeyUper);
    if (lib.isVal(this.getConfigVal('value'))) {
      this.set('value', this.getConfigVal('value'));
    }
    if (this.options) {
      this.set('options', this.options.slice());
    }
  };
  CustomSelectElement.prototype.actualEnvironmentDescriptor = function (myname) {
    var optionsfetcher = this.getConfigVal('optionsfetcher');
    var environmentname = this.getConfigVal('environmentname');
    var ret = TextInputWithListElement.prototype.actualEnvironmentDescriptor.call(this, name) || {};
    if (optionsfetcher && environmentname) {
      ret.logic = ret.logic || [];
      ret.logic.push({
        triggers: 'environment.'+environmentname+':state',
        references: '.>'+optionsfetcher,
        handler: this.fetchRemoteOptions.bind(this)
      },{
        triggers: '.>'+optionsfetcher,
        handler: this.onRemoteOptionsFetcher.bind(this)
      });
    }
    return ret;
  };
  CustomSelectElement.prototype.onDropDownShow = function (evntignored) {
    this.listContainer.width(this.$element.outerWidth());
  };
  CustomSelectElement.prototype.onDropDownShown = function (evntignored) {
    var chosen = this.optionThatCorrespondsToValue(this.value);
    if (chosen) {
      this.scrollInChosenElement(chosen);
    }
  };
  CustomSelectElement.prototype.onDropDownHide = function (evntignored) {
    if (this.selectedRawItem) {
      this.$element.val(this.rawItemToText(this.selectedRawItem));
    }
  };
  CustomSelectElement.prototype.onDropDownHidden = function (evntignored) {
    this.list.find('li').show();
  };

  CustomSelectElement.prototype.onFocus = function (evnt) {
    TextInputWithListElement.prototype.onFocus.call(this, evnt);
    lib.runNext(this.dropdown.show.bind(this.dropdown), 150);
    this.$element.select();
  };
  CustomSelectElement.prototype.onBlur = function (evnt) {
    var ret = TextInputWithListElement.prototype.onBlur.call(this, evnt);
    if (ret) {
      lib.runNext(this.dropdown.hide.bind(this.dropdown), 300);
    }
  };
  CustomSelectElement.prototype.showAllOptions = function () {
    jqhelpers.jQueryForEach(this.list, 'li', function(li) {jQuery(li).show();});
  };
  CustomSelectElement.prototype.onKeyDown = function (evnt) {
    TextInputWithListElement.prototype.onKeyDown.call(this, evnt);
  };
  CustomSelectElement.prototype.onKeyUp = function (evnt) {
    var txtval, txtlower, option;
    if (evnt && evnt.originalEvent) {
      //console.log('up', evnt.originalEvent.keyCode, evnt.originalEvent.key);
      if (evnt.originalEvent.key.length==1) {
        option = this.optionThatCorrespondsToValue(this.$element.val());
        if (option) {
          console.log('option', option);
        }
      }
      if (evnt.originalEvent.key.length>1) {
        switch (evnt.originalEvent.key) {
          case 'Enter':
            this.showAllOptions();
            this.$element.val(this.textThatCorrespondsToValue(this.get('value')));
            this.scrollInChosenElement(this.optionThatCorrespondsToValue(this.get('value')));
            this.$element.select();
            return false;
          case 'Backspace':
          case 'ArrowLeft':
          case 'ArrowRight':
          case 'End':
          case 'Home':
              break;
          default:
            return false;
        }
      }
    }
    txtval = this.$element.val();
    txtlower = txtval.toLowerCase();
    //console.log('hiding all options not containing', txtlower);
    this.hideAllOptionsNotContaining(txtlower);
    this.dropdown.show();
  };

  CustomSelectElement.prototype.isTextAnOptionText = function (txt) {
    var ret = jqhelpers.jQuerySome(this.list, 'li', optionTextLowerContains.bind(null, txt));
    txt = null;
    return ret;
  };
  CustomSelectElement.prototype.optionTextLowerContains = function (txt, li) {
    return li.innerHTML.toLowerCase().indexOf(txt)>=0;
  };

  CustomSelectElement.prototype.showAllOptions = function () {
    jqhelpers.jQueryForEach(this.list, 'li:hidden', function (li) {
      jQuery(li).show();
    });
  };
  CustomSelectElement.prototype.hideAllOptionsNotContaining = function (txt) {
    jqhelpers.jQueryForEach(this.list, 'li', this.liCaseInsensitiveTxtShower.bind(this, txt));
    txt = null;
  };
  CustomSelectElement.prototype.liCaseInsensitiveTxtShower = function (txt, li) {
    jQuery(li)[this.optionTextLowerContains(txt, li) ? 'show': 'hide']();
  }

  CustomSelectElement.prototype.optionThatCorrespondsToValue = function (val) {
    var valuepath, ret;
    if (!this.optionMap) {
      return;
    }
    valuepath = this.getConfigVal('valuepath');
    ret = this.optionMap.traverseConditionally(function(optdata) {
      if (lib.isEqual(optdata.value, val)){
        return optdata.li;
      }
    });
    valuepath = null;
    val = null;
    return ret;
  };
  CustomSelectElement.prototype.textThatCorrespondsToValue = function (val) {
    var elem = this.optionThatCorrespondsToValue(val);
    return elem ? elem.innerHTML : '';
  };
  CustomSelectElement.prototype.scrollInChosenElement = function (chosen) {
    var contst = this.listContainer[0].scrollTop;
    var listtop = this.list.offset().top;
    var chosentop = jQuery(chosen).offset().top;
    this.listContainer[0].scrollTop = chosentop - listtop;
  };

  CustomSelectElement.prototype.fetchRemoteOptions = function (fetcher, state) {
    if (state !== 'established') {
      return;
    }
    if (lib.isFunction(fetcher)) {
      try {
        fetcher(this.callArrayForRemoteOptionsFetcher());
      } catch (e) {
        this.$element.val(e.message);
      }
    }
  };
  CustomSelectElement.prototype.callArrayForRemoteOptionsFetcher = function () {
    return [];
  };
  CustomSelectElement.prototype.onRemoteOptionsFetcher = function (func) {
    if (!func) { return; }
    if (func.running) {
      this.$element.prop('disabled', true);
      return;
    }
    this.$element.prop('disabled', false);
    this.set('options', func.result||[]);
  };

  function valueOfData (data, dflt, valuepath) {
    var ret;
    if (lib.isArray(valuepath)) {
      ret = JSON.stringify(valuepath.map(valueOfData.bind(null, data, dflt)));
      data = null;
      dflt = null;
      return ret;
    }
    return data ? (valuepath ? data[valuepath] : data) : (lib.defined(dflt) ? dflt : data);
  }

  function optionForValuePicker (valpath, val, li) {
    var data;
    try {
      data = JSON.parse(li.getAttribute('data'));
      if (!data) {
        return;
      }
      if (lib.isEqual(valueOfData(data, void 0, valpath), val)) {
        return true;
      }
    } catch(e) {
      console.error(e);
    }
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
