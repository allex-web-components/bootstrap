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