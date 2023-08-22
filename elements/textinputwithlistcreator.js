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
    this.destroyable.optionProducerOld(this.rawItems[this.currentIndex]);
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
    this.keyDowner = this.onKeyDown.bind(this);
    this.itemChooser = this.chooseItem.bind(this);
    this.onClickeder = this.onClicked.bind(this);
    this.onHider = this.onHide.bind(this);
    this.onFocuser = this.onFocus.bind(this);
    this.onBlurer = this.onBlur.bind(this);
    this.dropDownOn = false;
  }
  lib.inherit(TextInputWithListElement, WebElement);
  DataHolderMixin.addMethods(TextInputWithListElement);
  TextInputWithListElement.prototype.__cleanUp = function () {
    if (this.$element && this.waiter) {
      this.$element.off('blur', this.onBlurer);
      this.$element.off('focus', this.onFocuser);
      this.$element.off('keydown', this.keyDowner);
      this.$element.off('hide.bs.dropdown', this.onHider);
      this.$element.off('show.bs.dropdown', this.onClickeder);
    }
    this.dropDownOn = false;
    this.onBlurer = null;
    this.onFocuser = null;
    this.onClickeder = null;
    this.itemChooser = null;
    this.keyDowner = null;
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
    this.$element.on('keydown', this.keyDowner);
    this.$element.on('show.bs.dropdown', this.onClickeder);
    this.$element.on('hide.bs.dropdown', this.onHider);
    this.$element.on('focus', this.onFocuser);
    this.$element.on('blur', this.onBlurer);
  };
  TextInputWithListElement.prototype.processWaiter = function () {
    if (!(this.$element && this.$element.length>0)){
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
    //(lib.isArray(rawitems) ? rawitems : []).forEach(this.optionProducerOld.bind(this)); //dangerously slow for a lot of rawitems
  };
  TextInputWithListElement.prototype.onListFilled = function () {  };
  //static
  function listFillerOld (items, olditemslength) {
    var i, item, top;
    top = items.length;
    this.rawItemsToFillIn = items;
    if (top>_MAX_ITEMS_TO_FILLIN_ASYC) {
      top = _MAX_ITEMS_TO_FILLIN_ASYC;
    }
    for (i=0; i<top; i++) {
      this.optionProducerOld(items[i]);
      if (i==olditemslength) {
        this.onListFilled();
      }
    }
    this.jobs.run('.', new ListFillerJob(this, items, i)).then(this.onListFilled.bind(this));
  }
  function listFiller (items, olditemslength) {
    var innerhtml = (items||[]).reduce(this.optionProducer.bind(this), '');
    this.list[0].innerHTML = innerhtml;
    this.list.find('li').each(this.handleProducedOption.bind(this, items));
    items = null;
    lib.runNext(this.onListFilled.bind(this));
  }
  //static end
  //should go to lib
  function hashReducer (rdcobj, val, key) {
    rdcobj.seed = rdcobj.func(rdcobj.seed, val, key);
  }
  function reduceHash (h, func, seed) {
    var seedobj = {seed: seed, func: func}, ret;
    lib.traverseShallow(h, hashReducer.bind(null, seedobj));
    ret = seedobj.seed;
    return ret;
  }
  //endof should go to lib
  function csser (res, val, key) {
    return lib.joinStringsWith(res, key+':'+val+';', '');
  }
    function attriber (res, val, key) {
    return lib.joinStringsWith(res, key+"='"+val+"'", ' ');
  }
  TextInputWithListElement.prototype.optionProducer = function (res, rawitem) {
    var desc = {
      css: {
        'white-space': 'pre'
      },
      attrib: {

      },
      class: ['dropdown-item'],
      contents: ''
    };
    this.makeUpOption(desc, rawitem);
    var finalcss = reduceHash(desc.css, csser, '');
    var finalattrs = reduceHash(desc.attrib, attriber, '');
    res = lib.joinStringsWith(res, o(m.li
      , 'CLASS', desc.class.join(' ')
      , 'ATTRS', 'style="'+finalcss+'" '+finalattrs
      , 'CONTENTS', desc.contents
    ),'\n');
    return res;
  };
  TextInputWithListElement.prototype.makeUpOption = function (desc, rawitem) {
    var val = this.get('value');
    if (this.rawDataToTextInputValue(rawitem) == val) {
      desc.class.push('active');
    }
    desc.contents = this.rawItemToText(rawitem);
    desc.attrib.data = JSON.stringify(rawitem);
  };
  TextInputWithListElement.prototype.handleProducedOption = function (rawitems, index, li) {
    li.onclick = this.itemChooser;
  };
  TextInputWithListElement.prototype.optionProducerOld = function (rawitem) {
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

  TextInputWithListElement.prototype.onKeyDown = function (evnt) {
    var code = (evnt && evnt.originalEvent) ? evnt.originalEvent.code : null;
    switch (code) {
      case 'ArrowUp':
        evnt.preventDefault();
        evnt.stopPropagation();
        this.moveListSelection(-1);
        return;
        break;
      case 'ArrowDown':
        evnt.preventDefault();
        evnt.stopPropagation();
        this.moveListSelection(1);
        return;
        break;
      case 'Enter':
        this.makeUseOfVisibleActive(evnt);
        return;
        break;
  }
    this.waiter.triggerer(evnt);
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
    return this.makeUseOfElement(target);
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
    this.dropDownOn = true;
    this.clicked.fire([evnt, null]); //compatible with ClickableElement
  };
  TextInputWithListElement.prototype.onHide = function (evnt) {
    this.dropDownOn = false;
  };
  TextInputWithListElement.prototype.onFocus = function (evnt) {

  };
  TextInputWithListElement.prototype.onBlur = function (evnt) {
    var active;
    if (!this.list) {return;}
    active = this.list.find('li.active');
    if (!(active && active.length>0)) {
      return;
    }
    this.makeUseOfElement(active);
  };
  TextInputWithListElement.prototype.makeUseOfVisibleActive = function (evnt) {
    var active;
    if (!this.list.is(':visible')) {return;}
    active = this.list.find('li.active');
    if (!(active && active.length>0)) {
      return;
    }
    evnt.preventDefault();
    evnt.stopPropagation();
    this.makeUseOfElement(active);
    this.dropdown.hide();
  };
  TextInputWithListElement.prototype.makeUseOfElement = function (element) {
    var data;
    var el = (element && element.length>0) ? element[0] : element;
    try {
      data = JSON.parse(el.getAttribute('data'));
      this.makeUseOfChosenItemData(data);
      return el;
    } catch(ignore) {
      console.error('sta sad?', ignore, 'na', el);
      return null;
    }
  }

  TextInputWithListElement.prototype.moveListSelection = function (direction) {
    var active, target, data;
    if (!(lib.isNumber(direction) && direction)) {
      return;
    }
    if (!this.list.is(':visible')) {
      return;
    }
    active = this.list.find('li.active');
    target = target4direction(this.list, active, direction);
    if (target && target.length>0) {
      active.removeClass('active');
      target.first().addClass('active');
      target[0].scrollIntoView();

    }
  };
  function target4direction (list, active, direction) {
    if (!(active && active.length>0)) {
      return direction>0
      ?
      list.find('li:visible:first')
      :
      list.find('li:visible:last');
    }
    return direction>0 ? active.nextAll(':visible') : active.prevAll(':visible');
  }

  TextInputWithListElement.prototype.postInitializationMethodNames = TextInputWithListElement.prototype.postInitializationMethodNames.concat(['prepareTextInput']);

  applib.registerElementType('TextInputWithList', TextInputWithListElement);

}
module.exports = createTextInputWithList;