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
    this.$element.attr('data-bs-html', true);
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