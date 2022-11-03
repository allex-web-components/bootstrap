function createServerLookup (execlib, applib, mylib) {
  'use strict';

  var lib = execlib.lib,
    TextInputWithListElement = applib.getElementType('TextInputWithList');
  
  function ServerLookupElement (id, options) {
    if (!(options && options.environmentname)) {
      throw new lib.Error('NO_ENVIRONMENTNAME', 'Options for '+this.constructor.name+' must specify the "environmentname"');
    }
    TextInputWithListElement.call(this, id, options);
    this.initiallyFilled = false;
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
    this.initiallyFilled = null;
    TextInputWithListElement.prototype.__cleanUp.call(this);
  };
  ServerLookupElement.prototype.fillList = function (rawitems) {
    var currval;
    if (!this.initiallyFilled) {
      rawitems = [];
      this.initiallyFilled = true;
      currval = this.get('value');
      if (lib.isVal(currval)) {
        lib.runNext(this.needLookup.fire.bind(this.needLookup, currval));
      }
    }
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