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