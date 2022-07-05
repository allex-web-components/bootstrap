(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function createCustomSelect (execlib, applib, mylib) {
  'use strict';

  var lib = execlib.lib,
    jquerylib = execlib.execSuite.libRegistry.get('allex_jqueryelementslib'),
    jqhelpers = jquerylib.helpers,
    TextInputWithListElement = applib.getElementType('TextInputWithList');
  
  function CustomSelectElement (id, options) {
    TextInputWithListElement.call(this, id, options);
    this.options = (options && lib.isArray(options.options)) ? options.options : null;
    this.value = null;
    this.selectedRawItem = null;
    this.itemFoundFromExistingValue = null;
    this.optionMap = new lib.Map();
    this.onDropDownShower = this.onDropDownShow.bind(this);
    this.onDropDownShowner = this.onDropDownShown.bind(this);
    this.onDropDownHider = this.onDropDownHide.bind(this);
    this.onDropDownHiddener = this.onDropDownHidden.bind(this);
    this.onFocuser = this.onFocus.bind(this);
    this.onBlurer = this.onBlur.bind(this);
    this.onKeyDowner = this.onKeyDown.bind(this);
    this.onKeyUper = this.onKeyUp.bind(this);
  }
  lib.inherit(CustomSelectElement, TextInputWithListElement);
  CustomSelectElement.prototype.__cleanUp = function () {
    if (this.$element) {
      this.$element.off('shown.bs.dropdown', this.onDropDownShowner);
      this.$element.off('show.bs.dropdown', this.onDropDownShower);
      this.$element.off('hide.bs.dropdown', this.onDropDownHider);
      this.$element.off('hidden.bs.dropdown', this.onDropDownHiddener);
      this.$element.off('blur', this.onBlurer);
      this.$element.off('focus', this.onFocuser);
      this.$element.off('keydown', this.onKeyDowner);
      this.$element.off('keyup', this.onKeyUper);
    }
    this.onKeyUper = null;
    this.onKeyDowner = null;
    this.onBlurer = null;
    this.onFocuser = null;
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
    this.set('value', valueOfData(rawitem, this.getConfigVal('valuepath'), ''));
    return this.rawItemToText(rawitem);
  };
  CustomSelectElement.prototype.chooseItem = function (evnt) {
    var chosen = TextInputWithListElement.prototype.chooseItem.call(this, evnt);
    if (chosen) {
      this.showAllOptions();
    }
  };
  CustomSelectElement.prototype.makeUseOfProducedOption = function (li, rawitem) {
    var id = lib.uid(), txt, val, option;
    txt = this.rawItemToText(rawitem);
    val = valueOfData(rawitem, this.getConfigVal('valuepath'));
    li.text(txt);
    li.attr('data', JSON.stringify(id));
    option = {
      li: li,
      data: rawitem,
      value: val
    };
    this.optionMap.add(id, option);
    this.list.append(li);
    if (this.get('value') == val) {
      this.itemFoundFromExistingValue = option;
      this.set('htmlvalue', txt);
    }
  };
  CustomSelectElement.prototype.makeUseOfChosenItemData = function (data) {
    //data is actually id
    if (!this.optionMap) {
      return;
    }
    var optdata = this.optionMap.get(data);
    if (!optdata) {
      return;
    }
    this.set('htmlvalue', this.rawDataToTextInputValue(optdata.data));
  };
  CustomSelectElement.prototype.chooseItem = function (evnt) {
    return TextInputWithListElement.prototype.chooseItem.call(this, evnt);
  };
  CustomSelectElement.prototype.onListFilled = function () {
    var options;
    if (!this.itemFoundFromExistingValue) {
      //console.log('item not found from', this.get('options'));
      options = this.get('options');
      if (lib.isArray(options) && options.length>0) {
        this.set('value', valueOfData(options[0], this.getConfigVal('valuepath')));
      }
    }
  };

  CustomSelectElement.prototype.set_options = function (options) {
    var val;
    if (this.optionMap) {
      this.optionMap.purge();
    }
    this.options = options;
    this.itemFoundFromExistingValue = null;
    this.fillList(options);
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
    return true;
  };

  CustomSelectElement.prototype.prepareCustomSelect = function () {
    this.$element.on('show.bs.dropdown', this.onDropDownShower);
    this.$element.on('shown.bs.dropdown', this.onDropDownShowner);
    this.$element.on('hide.bs.dropdown', this.onDropDownHider);
    this.$element.on('hidden.bs.dropdown', this.onDropDownHiddener);
    this.$element.on('focus', this.onFocuser);
    this.$element.on('blur', this.onBlurer);
    this.$element.on('keydown', this.onKeyDowner);
    this.$element.on('keyup', this.onKeyUper);
    if (this.options) {
      this.set('options', this.options.slice());
    }
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

  CustomSelectElement.prototype.onFocus = function () {
    lib.runNext(this.dropdown.show.bind(this.dropdown), 150);
    this.$element.select();
  };
  CustomSelectElement.prototype.onBlur = function () {
    lib.runNext(this.dropdown.hide.bind(this.dropdown), 300);
  };
  CustomSelectElement.prototype.showAllOptions = function () {
    jqhelpers.jQueryForEach(this.list, 'li', function(li) {jQuery(li).show();});
  };
  CustomSelectElement.prototype.onKeyDown = function (evnt) {
    if (evnt && evnt.originalEvent) {
      //console.log ('down', evnt.originalEvent.keyCode, evnt.originalEvent.key)
    }
  };
  CustomSelectElement.prototype.onKeyUp = function (evnt) {
    var txtval, txtlower;
    if (evnt && evnt.originalEvent) {
      //console.log('up', evnt.originalEvent.keyCode, evnt.originalEvent.key);
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

  CustomSelectElement.prototype.optionThatCorrespondsToValue = function (val) {
    var valuepath, ret;
    if (!this.optionMap) {
      return;
    }
    valuepath = this.getConfigVal('valuepath');
    ret = this.optionMap.traverseConditionally(function(optdata) {
      if (lib.isEqual(optdata.value, val)){
        return optdata.li[0];
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

  //statics
  function valueOfData (data, valuepath, dflt) {
    return data ? (valuepath ? data[valuepath] : data) : (lib.defined(dflt) ? dflt : data);
  }

  function optionForValuePicker (valpath, val, li) {
    var data;
    try {
      data = JSON.parse(li.getAttribute('data'));
      if (!data) {
        return;
      }
      if (lib.isEqual(valueOfData(data, valpath), val)) {
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

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
function createElements (execlib, applib, mylib) {
  'use strict';

  require('./modalcreator')(execlib.lib, applib, mylib);
  require('./datamodalcreator')(execlib.lib, applib);
	require('./modalformcreator')(execlib, applib);
  require('./offcanvascreator')(execlib.lib, applib);
	require('./popupcreator')(execlib, applib, mylib);
	require('./questioncreator')(execlib, applib, mylib);
	require('./textinputwithlistcreator')(execlib, applib, mylib);
	require('./serverlookupcreator')(execlib, applib, mylib);
	require('./customselectcreator')(execlib, applib, mylib);
	require('./toastscreator')(execlib, applib, mylib);
}
module.exports = createElements;

},{"./customselectcreator":1,"./datamodalcreator":2,"./modalcreator":4,"./modalformcreator":5,"./offcanvascreator":6,"./popupcreator":7,"./questioncreator":8,"./serverlookupcreator":9,"./textinputwithlistcreator":10,"./toastscreator":11}],4:[function(require,module,exports){
function createModalElement (lib, applib, mylib) {
  'use strict';

  var DivElement = applib.getElementType('DivElement'),
    ResurrectableMixin = mylib.mixins.Resurrectable;

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
    ResurrectableMixin.call(this, options);
    this.modalInstance;
    this.modal_backdrop = findinoptions(options, 'backdrop', true);
    this.modal_keyboard = findinoptions(options, 'keyboard', true);
    this.modal_show = findinoptions(options, 'show', true);
  }
  lib.inherit(BSModalDiv, DivElement);
  ResurrectableMixin.addMethods(BSModalDiv);
  BSModalDiv.prototype.__cleanUp = function () {
    this.modal_show = null;
    this.modal_keyboard = null;
    this.modal_backdrop = null;
    this.modalInstance = null;
    ResurrectableMixin.prototype.destroy.call(this);
    DivElement.prototype.__cleanUp.call(this);
  };
  BSModalDiv.prototype.set_actual = function (act) {
    var ret = DivElement.prototype.set_actual.call(this, act);
    this.handleActualChangeForResurrect(act);
    return ret;
  }
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
    if (this.$element.find('.modal-dialog').length != 1) {
      throw new lib.Error('NEED_MODALDIALOG', this.id+' has to have a modal-dialog classed div within its $element, bootstrap.Modal will need it to work');
    }
    this.modalInstance = new bootstrap.Modal(this.$element, {
      backdrop: this.modal_backdrop,
      keyboard: this.modal_keyboard,
      show: this.modal_show
    });
    this.$element.on('shown.bs.modal', this.onShownBsModal.bind(this));
    this.$element.on('hidden.bs.modal', this.onHiddenBsModal.bind(this));
  };
  BSModalDiv.prototype.onShownBsModal = function (ev) {
    var zindex;
    this.evaluateResurrectionTarget(ev);
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
    var bd = jQuery('.modal-backdrop').not('.modal-stack'),
      bdcss = this.getConfigVal('modal_backdrop_class');
    
    if (bd.length<1) {
      var bdz = 1049;
      jQuery('.modal-backdrop').each(function (index, mbd){
        jQuery(mbd).css('z-index', bdz);
        bdz++;
      })
      bdz = null;
      return;
    }
    bd.css('z-index', zindex-1);
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
function createOffCanvasElement (lib, applib) {
  'use strict';

  var DivElement = applib.getElementType('DivElement');

  function OffCanvasElement (id, options) {
    DivElement.call(this, id, options);
  }
  lib.inherit(OffCanvasElement, DivElement);

  OffCanvasElement.prototype.hookToOffScreen = function () {
    if (!this.$element.hasClass('offcanvas')) {
      this.$element.addClass('offcanvas');
    }
    this.$element.on('show.bs.offcanvas', this.onShowOffCanvas.bind(this));
    this.$element.on('hidden.bs.offcanvas', this.onHiddenOffCanvas.bind(this));
  };

  OffCanvasElement.prototype.onShowOffCanvas = function () {
    this.set('actual', true);
  };
  OffCanvasElement.prototype.onHiddenOffCanvas = function () {
    this.set('actual', false);
  };

  OffCanvasElement.prototype.postInitializationMethodNames = 
    DivElement.prototype.postInitializationMethodNames.concat(['hookToOffScreen']);

  applib.registerElementType('OffCanvasElement', OffCanvasElement);
}
module.exports = createOffCanvasElement;
},{}],7:[function(require,module,exports){
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
    if (lib.isFunction(obj.cb)) {
      obj.cb();
    }
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
  PopUpElement.prototype.actualEnvironmentDescriptor = function (myname) {
    var cq = this.getConfigVal('closequestion');
    if (!(cq && cq.path)) {
      return BSModalDivElement.prototype.actualEnvironmentDescriptor.call(this, myname);
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
function createServerLookup (execlib, applib, mylib) {
  'use strict';

  var lib = execlib.lib,
    TextInputWithListElement = applib.getElementType('TextInputWithList');
  
  function ServerLookupElement (id, options) {
    if (!(options && options.environmentname)) {
      throw new lib.Error('NO_ENVIRONMENTNAME', 'Options for '+this.constructor.name+' must specify the "environmentname"');
    }
    TextInputWithListElement.call(this, id, options);
    this.needLookup = this.createBufferableHookCollection();
    this.chosenProposal = null;
  }
  lib.inherit(ServerLookupElement, TextInputWithListElement);
  ServerLookupElement.prototype.__cleanUp = function () {
    this.chosenProposal = null;
    if (this.needLookup) {
      this.needLookup.destroy();
    }
    this.needLookup = null;
    TextInputWithListElement.prototype.__cleanUp.call(this);
  };
  ServerLookupElement.prototype.fillList = function (rawitems) {
    TextInputWithListElement.prototype.fillList.call(this, rawitems);
    this.dropdown.show();
  };
  ServerLookupElement.prototype.processTextInput = function (val) {
    if (val) {
      this.needLookup.fire(val);
      return;
    }
    this.clearList();
  };
  ServerLookupElement.prototype.makeUseOfChosenItemData = function (data) {
    var ret = TextInputWithListElement.prototype.makeUseOfChosenItemData.call(this, data);
    this.set('chosenProposal', data);
    return ret;
  };

  ServerLookupElement.prototype.actualEnvironmentDescriptor = function (myname) {
    var funcname = this.serverLookupFuncName();
    return {
      preprocessors: {
        Command: [{
          environment: this.getConfigVal('environmentname'),
          entity: {
            name: funcname,
            options: {
              sink: '.',
              name: funcname
            }
          }
        }]
      },
      logic: [{
        triggers: 'element.'+myname+'!needLookup',
        references: '.>'+funcname,
        handler: this.onReadyToCallServerLookupFunc.bind(this)
      },{
        triggers: '.>'+funcname,
        handler: this.onLookupFunc.bind(this)
      }]
    };
  };
  ServerLookupElement.prototype.serverLookupFuncName = function () {
    throw new lib.Error('NOT_IMPLEMENTED', this.constructor.name+' must implement serverLookupFuncName');
  };
  ServerLookupElement.prototype.onReadyToCallServerLookupFunc = function (lookupfunc, val) {
    if (!(lookupfunc && val)) {
      return;
    }
    lookupfunc(this.callArrayForServerLookupFunc(val));
  };
  ServerLookupElement.prototype.callArrayForServerLookupFunc = function (valueforlookup) {
    throw new lib.Error('NOT_IMPLEMENTED', this.constructor.name+' must implement callArrayForServerLookupFunc');
  };
  ServerLookupElement.prototype.onLookupFunc = function (func) {
    if (!(func && !func.running && func.result)) {
      return;
    }
    this.fillList(func.result);
  };

  applib.registerElementType('ServerLookup', ServerLookupElement);
}
module.exports = createServerLookup;
},{}],10:[function(require,module,exports){
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
    this.rawItemsToFillIn = null;
    this.itemChooser = this.chooseItem.bind(this);
  }
  lib.inherit(TextInputWithListElement, WebElement);
  DataHolderMixin.addMethods(TextInputWithListElement);
  TextInputWithListElement.prototype.__cleanUp = function () {
    this.itemChooser = null;
    this.rawItemsToFillIn = null;
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
    if (!this.dropdown) {
      return;
    }
    this.clearList();
    this.dropdown.hide();
    listFiller.call(this, (lib.isArray(rawitems) ? rawitems : []));
    //(lib.isArray(rawitems) ? rawitems : []).forEach(this.optionProducer.bind(this)); //dangerously slow for a lot of rawitems
  };
  TextInputWithListElement.prototype.onListFilled = function () {  };
  //static
  function listFiller (items) {
    var i, item, top;
    top = items.length;
    this.rawItemsToFillIn = items;
    if (top>_MAX_ITEMS_TO_FILLIN_ASYC) {
      top = _MAX_ITEMS_TO_FILLIN_ASYC;
    }
    for (i=0; i<top; i++) {
      this.optionProducer(items[i]);
    }
    this.jobs.run('.', new ListFillerJob(this, items, i)).then(this.onListFilled.bind(this));
  }
  //static end
  TextInputWithListElement.prototype.optionProducer = function (rawitem) {
    var li = jQuery('<li>');
    //console.log('proposal', prop);
    li.on('click', this.itemChooser);
    li.addClass('dropdown-item');
    this.makeUseOfProducedOption(li, rawitem);
  };
  TextInputWithListElement.prototype.makeUseOfProducedOption = function (li, rawitem) {
    li.text(this.rawItemToText(rawitem));
    li.attr('data', JSON.stringify(rawitem));
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
      this.makeUseOfChosenItemData(data);
      return evnt.target;
    } catch(ignore) {
      console.error('sta sad?', ignore, 'na', evnt.target);
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

  TextInputWithListElement.prototype.postInitializationMethodNames = TextInputWithListElement.prototype.postInitializationMethodNames.concat(['prepareTextInput']);

  applib.registerElementType('TextInputWithList', TextInputWithListElement);

}
module.exports = createTextInputWithList;
},{}],11:[function(require,module,exports){
function createToast (execlib, applib, mylib) {
  'use strict';
  var lib = execlib.lib,
    WebElement = applib.getElementType('WebElement');

  function ToastContainerElement (id, options) {
    options = options || {};
    options.default_markup = options.default_markup || mylib.markups.toastsContainer(options.markup);
    WebElement.call(this, id, options);
  }
  lib.inherit(ToastContainerElement, WebElement);
  ToastContainerElement.prototype.addToast = function (options) {
    this.createElement({
      type: 'Toast',
      name: lib.uid(),
      options: lib.extend(options, {
        actual: false
      })
    });
  };
  ToastContainerElement.prototype.monitorPromise = function (promise, options) {
    if (!lib.q.isThenable(promise)){
      return;
    }
    options = options || {};
    promise.then(
      this.showPromiseSuccessToast.bind(this, options.success),
      this.showPromiseFailToast.bind(this, options.fail)
    );
  };
  ToastContainerElement.prototype.showPromiseSuccessToast = function (options, res) {
    var title, caption;
    options = options || {};
    title = lib.isFunction(options.title) ? options.title(res) : options.title;
    caption = lib.isFunction(options.caption) ? options.caption(res) : options.caption;
    this.addToast({
      delay: lib.isNumber(options.delay) ? options.delay : 1000,
      autohide: ('autohide' in options ? options.autohide : true),
      animation: ('animation' in options ? options.animation : true),
      markup: {
        status: 'success',
        header: {
          contents: title || 'Success'
        },
        body: {
          contents: caption || res
        }
      }
    })
  };
  ToastContainerElement.prototype.showPromiseFailToast = function (options, reason) {
    var title, caption;
    options = options || {};
    title = lib.isFunction(options.title) ? options.title(reason) : options.title;
    caption = lib.isFunction(options.caption) ? options.caption(reason) : options.caption;
    this.addToast({
      delay: lib.isNumber(options.delay) ? options.delay : 3000,
      autohide: ('autohide' in options ? options.autohide : true),
      animation: ('animation' in options ? options.animation : true),
      markup: {
        status: 'error',
        header: {
          contents: title || 'Error'
        },
        body: {
          contents: caption || (reason ? (reason.message ? reason.message : reason) : 'Null Error')
        }
      }
    })
  };
  applib.registerElementType('ToastContainer', ToastContainerElement);

  function ToastElement (id, options) {
    options = options || {};
    options.default_markup = options.default_markup || mylib.markups.toast(options.markup);
    WebElement.call(this, id, options);
  }
  lib.inherit(ToastElement, WebElement);
  ToastElement.prototype.doToast = function () {
    var options = lib.pick(this.config, ['delay', 'animation', 'autohide']);
    this.$element.on('hidden.bs.toast', this.destroy.bind(this));
    var toast = new bootstrap.Toast(this.$element[0], options);
    toast.show();
    this.set('actual', true);
  };
  ToastElement.prototype.postInitializationMethodNames = WebElement.prototype.postInitializationMethodNames.concat(['doToast']);
  applib.registerElementType('Toast', ToastElement);
}
module.exports = createToast;
},{}],12:[function(require,module,exports){
(function (execlib) {
  var lib = execlib.lib,
    lR = execlib.execSuite.libRegistry,
    applib = lR.get('allex_applib'),
    mylib = {};

  mylib.mixins = require('./mixins')(execlib);
  mylib.markups = require('./markup')(execlib);
  mylib.jobs = require('./jobs')(execlib);
  require('./elements')(execlib, applib, mylib);

  lR.register('allex_bootstrapwebcomponent', mylib);
})(ALLEX)

},{"./elements":3,"./jobs":13,"./markup":20,"./mixins":24}],13:[function(require,module,exports){
function createJobs (execlib) {
  'use strict';
  var mylib = {
    question2function: require('./question2function')(execlib)
  };

  return mylib;
}
module.exports = createJobs;
},{"./question2function":16}],14:[function(require,module,exports){
function createQuestion2FunctionJobBase (lib, mylib) {
  'use strict';

  function Question2FunctionJob (question, func, defer) {
    lib.qlib.JobOnDestroyable.call(this, question, defer);
    this.func = func;
  }
  lib.inherit(Question2FunctionJob, lib.qlib.JobOnDestroyable);
  Question2FunctionJob.prototype.destroy = function () {
    this.func = null;
    lib.qlib.JobOnDestroyable.prototype.destroy.call(this);
  };
  Question2FunctionJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    this.destroyable.ask({
      type: 'YesNo',
      title: this.title(),
      caption: this.createInput(),
      //onCreated: console.log.bind(console, 'created'),
      yes: this.okCaption(),
      no: 'Cancel'
    }).then(
      this.onQuestion.bind(this),
      this.resolve.bind(this, false)
    );
    return ok.val;
  };
  Question2FunctionJob.prototype.onQuestion = function (res) {
    if (!this.okToProceed()) {
      return;
    }
    if (!res) {
      this.notify({skipping_function: true});
      this.resolve(false);
      return;
    }

    lib.qlib.promise2defer(this.func(this.argumentArrayForFunction()), this);
  };
  mylib.Question2Function = Question2FunctionJob;
}
module.exports = createQuestion2FunctionJobBase;
},{}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
function createQuestion2FunctionJobs (execlib) {
  'use strict';

  var lib = execlib.lib,
    applib = execlib.execSuite.libRegistry.get('allex_applib');
  var mylib = {mixins:{}};
  require('./basecreator')(lib, mylib);
  require('./predefinedcreator')(lib, mylib);
  require('./paramcreator')(lib, mylib);
  require('./simpleinputcreator')(lib, mylib);
  require('./formcreator')(applib, lib, mylib);

  return mylib;

}
module.exports = createQuestion2FunctionJobs;
},{"./basecreator":14,"./formcreator":15,"./paramcreator":17,"./predefinedcreator":18,"./simpleinputcreator":19}],17:[function(require,module,exports){
function createParamQuestion2FunctionJob (lib, mylib) {
  'use strict';
  var Question2FunctionJob = mylib.Question2Function;

  function ParamQuestion2FunctionJob (question, func, defer) {
    Question2FunctionJob.call(this, question, func, defer);
    this.uid = lib.uid();
  }
  lib.inherit(ParamQuestion2FunctionJob, Question2FunctionJob);
  ParamQuestion2FunctionJob.prototype.destroy = function () {
    this.uid = null;
    Question2FunctionJob.prototype.destroy.call(this);
  };
  ParamQuestion2FunctionJob.prototype.argumentArrayForFunction = function () {
    var val;
    val = this.destroyable.$element.find('[fixquestionelement="'+this.uid+'"]').val();
    val = this.postProcessInput(val);
    if (!lib.defined(val)) {
      this.resolve(false);
      return;
    }
    return this.parametrizedArgumentArrayForFunction(val);
  };
  ParamQuestion2FunctionJob.prototype.initialInputValue = function () {
    return '';
  };
  ParamQuestion2FunctionJob.prototype.postProcessInput = function (val) {
    return val;
  };
  ParamQuestion2FunctionJob.prototype.parametrizedArgumentArrayForFunction = function (val) {
    return [val];
  };
  mylib.Param = ParamQuestion2FunctionJob;
}
module.exports = createParamQuestion2FunctionJob;
},{}],18:[function(require,module,exports){
function createQuestion2PredefinedFunctionJob (lib, mylib) {
  'use strict';
  var Question2FunctionJob = mylib.Question2Function;

  function Question2PredefinedFunctionJob (question, func, options, defer) {
    Question2FunctionJob.call(this, question, func, defer);
    this.options = options;
  }
  lib.inherit(Question2PredefinedFunctionJob, Question2FunctionJob);
  Question2PredefinedFunctionJob.prototype.destroy = function () {
    this.options = null;
    Question2FunctionJob.prototype.destroy.call(this);
  };
  Question2FunctionJob.prototype.title = function () {
    return this.options.title;
  };
  Question2FunctionJob.prototype.createInput = function () {
    return this.options.caption;
  };
  Question2FunctionJob.prototype.okCaption = function () {
    return this.options.ok || 'Yes';
  };
  Question2PredefinedFunctionJob.prototype.argumentArrayForFunction = function () {
    return this.options.params;
  };
  mylib.Predefined = Question2PredefinedFunctionJob;

}
module.exports = createQuestion2PredefinedFunctionJob;
},{}],19:[function(require,module,exports){
function createSimpleInputQuestion2FunctionJob (lib, mylib) {
  'use strict';

  var ParamQuestion2FunctionJob = mylib.Param;

  function SimpleInputParamQuestion2FunctionJob (question, func, defer) {
    ParamQuestion2FunctionJob.call(this, question, func, defer);
  }
  lib.inherit(SimpleInputParamQuestion2FunctionJob, ParamQuestion2FunctionJob);
  SimpleInputParamQuestion2FunctionJob.prototype.createInput = function () {
    return '<'+this.inputType+' class="form-control" fixquestionelement="'+this.uid+'" value="'+(
      this.initialInputValue()
    )+'"/>';
  };
  mylib.SimpleInput = SimpleInputParamQuestion2FunctionJob;

  function SimpleNumberInputMixin () {

  }
  SimpleNumberInputMixin.prototype.postProcessInput = function (val) {
    val = parseInt(val);
    if (isNaN(val)) {
      return;
    }
    return val;
  };
  SimpleNumberInputMixin.addMethods = function (klass) {
    lib.inheritMethods(klass, SimpleNumberInputMixin
      ,'postProcessInput'
    );
    klass.prototype.inputType = 'input type="number"';
  };
  mylib.mixins.SimpleNumber = SimpleNumberInputMixin;

  

  function SimpleTextAreaParamQuestion2FunctionJob (question, func, defer) {
    ParamQuestion2FunctionJob.call(this, question, func, defer);
  }
  lib.inherit(SimpleTextAreaParamQuestion2FunctionJob, ParamQuestion2FunctionJob);
  SimpleTextAreaParamQuestion2FunctionJob.prototype.createInput = function () {
    return '<textarea class="form-control" fixquestionelement="'+this.uid+'">'+this.initialInputValue()+'</textarea>';
  };
  mylib.SimpleTextArea = SimpleTextAreaParamQuestion2FunctionJob;

}
module.exports = createSimpleInputQuestion2FunctionJob;
},{}],20:[function(require,module,exports){
function createMarkups (execlib) {
  'use strict';
  var lib = execlib.lib,
    lR = execlib.execSuite.libRegistry,
    o = lR.get('allex_templateslitelib').override,
    m = lR.get('allex_htmltemplateslib'),
    s = lR.get('allex_svgtemplateslib'),
    mylib = {};

    require('./modal')(lib, o, m, mylib);
    require('./question')(lib, o, m, mylib);
    require('./toasts')(lib, o, m, s, mylib);

  return mylib;
}
module.exports = createMarkups;
},{"./modal":21,"./question":22,"./toasts":23}],21:[function(require,module,exports){
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
            options.noheader ? '' : o(m.div,
              'CLASS', 'modal-header',
              'ATTRS', 'popupelement="TitleContainer"',
              'CONTENTS', [
                o(m.h5,
                  'CLASS', 'modal-title',
                  'ATTRS', 'popupelement="Title"',
                  'CONTENTS', (options.title || 'Title')
                ),
                (
                  options.nodefaultclose 
                  ? 
                  '' 
                  :
                  o(m.button,
                    'CLASS', 'btn-close',
                    'ATTRS', 'type="button" '+
                      (options.nodefaultclose ? '' : 'data-bs-dismiss="modal"')+
                      ' aria-label="'+(options.closecaption || 'Close')+'" popupelement="Close"'
                  )
                )
              ]
            ),
            o(m.div,
              'CLASS', 'modal-body',
              'ATTRS', 'popupelement="Body"',
              'CONTENTS', options.caption || ''
            ),
            options.nofooter ? '' : o(m.div,
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
},{}],22:[function(require,module,exports){
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
      return o(m.button,
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
},{}],23:[function(require,module,exports){
function createToastsMarkup (lib, o, m, s, mylib) {
  'use strict';

  function toastsContainer (options) {
    options = options || {};
    return o(m.div
      , 'CLASS', lib.joinStringsWith('toast-container', options.class, ' ')
      , 'ATTRS', lib.joinStringsWith('', options.attrs, ' ')
    )
  }
  mylib.toastsContainer = toastsContainer;

  function statusColor (status) {
    switch (status) {
      case 'error':
        return 'red';
      case 'warning':
        return 'yellow';
      case 'success':
        return 'green';
      case 'info':
        return 'grey';
      default:
        return 'black';
    }
  }

  function statusIcon (options) {
    if (!options.status) {
      return '';
    }
    return o(s.svg
      , 'CLASS', 'bd-placeholder-img rounded-3 me-2'
      , 'WIDTH', '15'
      , 'HEIGHT', '15'
      , 'CONTENTS', o(s.rect
        , 'FILL', statusColor(options.status)
      )
    );
  }

  function toast (options) {
    options = options || {};
    options.body = options.body || {};
    var contents = [];
    if (options.header) {
      contents.push(o(m.div
        , 'CLASS', lib.joinStringsWith('toast-header', options.header.class, ' ')
        , 'ATTRS', lib.joinStringsWith('', options.header.attrs, ' ')
        , 'CONTENTS', [
          statusIcon(options),
          o(m.strong
            , 'CLASS', 'me-auto'
            , 'CONTENTS', options.header.contents || ''
          ),
          o(m.button
            , 'CLASS', 'btn-close'
            , 'ATTRS', 'data-bs-dismiss="toast" aria-label="Close"'
          )
        ]
      ));
    }
    contents.push(o(m.div
      , 'CLASS', lib.joinStringsWith('toast-body', options.body.class, ' ')
      , 'ATTRS', lib.joinStringsWith('', options.body.attrs, ' ')
      , 'CONTENTS', lib.joinStringsWith('',options.body.contents || '', ' ')
    ));
    return o(m.div
      , 'CLASS', lib.joinStringsWith('toast fade show', options.class, ' ')
      , 'ATTRS', lib.joinStringsWith('', options.attrs, ' ')
      , 'CONTENTS', contents
    );
  }
  mylib.toast = toast;

  function toastsSubContainer (options) {
    options = options || {};
    options.pane = options.pane || {};
    options.button = options.button || {};
    options.wrapper = options.wrapper || {};
    return o(m.div
      , 'CLASS', lib.joinStringsWith('dropdown', options.pane.class, ' ')
      , 'ATTRS', lib.joinStringsWith('style="width=100%;"', options.pane.attrs, ' ')
      , 'CONTENTS', [
        o(m.button
          , 'CLASS', lib.joinStringsWith('dropdown', options.button.class, ' ')
          , 'ATTRS', lib.joinStringsWith('style="width=100%;"', options.button.attrs, ' ')
        ),
        o(m.ul
          , 'CLASS', lib.joinStringsWith('dropdown', options.wrapper.class, ' ')
          , 'ATTRS', lib.joinStringsWith('style="width=100%;"', options.wrapper.attrs, ' ')
        )
      ]
    )
  }
  mylib.toastsSubContainer = toastsSubContainer;
}
module.exports = createToastsMarkup;
},{}],24:[function(require,module,exports){
function createMixins (execlib) {
  var mylib = {};

  require('./tooltipablecreator')(execlib, mylib);
  require('./resurrectablecreator')(execlib, mylib);

  return mylib;
}
module.exports = createMixins;
},{"./resurrectablecreator":25,"./tooltipablecreator":26}],25:[function(require,module,exports){
function createResurrectableMixin (execlib, mylib) {
  'use strict';

  var lib = execlib.lib;

  function ResurrectableMixin (options) {
    this.resurrectionAtrributeName = options ? options.resurrectionatrributename || 'data-bs-resurrect' : 'dataa-bs-resurrect';
    this.resurrectionTarget = null;
  }
  ResurrectableMixin.prototype.destroy = function () {
    this.resurrectionTarget = null;
    this.resurrectionAtrributeName = null;
  };

  ResurrectableMixin.prototype.evaluateResurrectionTarget = function (ev) {
    var resurrectiontarget;
    if (!this.resurrectionAtrributeName) {
      this.resurrectionTarget = null;
      return;
    }
    this.resurrectionTarget = jQuery(ev.relatedTarget).attr(this.resurrectionAtrributeName) || null;
  };

  ResurrectableMixin.prototype.handleActualChangeForResurrect = function (act) {
    var jqrest, rest, restmodalinstance;
    if (!act && this.resurrectionTarget) {
      jqrest = jQuery('#'+this.resurrectionTarget);
      if (jqrest && jqrest.length>0) {
        rest = jqrest[0];
        restmodalinstance = bootstrap.Modal.getInstance(rest);
        if (restmodalinstance) {
          restmodalinstance.show();
        }
      }
    }
  };

  ResurrectableMixin.addMethods = function (klass) {
    lib.inheritMethods(klass, ResurrectableMixin
      , 'evaluateResurrectionTarget'
      , 'handleActualChangeForResurrect'
    );
  };

  mylib.Resurrectable = ResurrectableMixin;
}
module.exports = createResurrectableMixin;
},{}],26:[function(require,module,exports){
function createTooltipableMixin (execlib, mylib) {
  'use strict';

  var lib = execlib.lib;

  function TooltipableMixin (options) {
    this.tooltipPosition = options.tooltip_position || 'bottom';
    this.tooltipText = null;
  }
  TooltipableMixin.prototype.destroy = function () {
    this.tooltipText = null;
    this.tooltipPosition = null;
  };

  TooltipableMixin.prototype.doTooltip = function () {
    this.$element.attr('data-bs-toggle', 'tooltip');
  };
  TooltipableMixin.prototype.get_tooltip_position = function () {
    return this.tooltipPosition;
  };
  TooltipableMixin.prototype.set_tooltip_position = function (pos) {
    this.tooltipPosition = pos;
    this.$element.attr('data-bs-placement', this.tooltipPosition);
    return true;
  };
  TooltipableMixin.prototype.get_tooltip_text = function () {
    return this.tooltipText;
  };
  TooltipableMixin.prototype.set_tooltip_text = function (txt) {
    this.tooltipText = txt;
    this.$element.attr('title', this.tooltipText);
    return true;
  };


  TooltipableMixin.addMethods = function (klass, parentklass) {
    lib.inheritMethods(klass, TooltipableMixin
      , 'doTooltip'
      , 'get_tooltip_position'
      , 'set_tooltip_position'
      , 'get_tooltip_text'
      , 'set_tooltip_text'
    );
    klass.prototype.postInitializationMethodNames = parentklass.prototype.postInitializationMethodNames.concat(['doTooltip']);
  };

  mylib.Tooltipable = TooltipableMixin;
}
module.exports = createTooltipableMixin;
},{}]},{},[12]);
