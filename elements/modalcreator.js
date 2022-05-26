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
