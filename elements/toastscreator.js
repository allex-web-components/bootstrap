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