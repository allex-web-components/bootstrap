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
            o(m.div,
              'CLASS', 'modal-header',
              'ATTRS', 'popupelement="TitleContainer"',
              'CONTENTS', [
                o(m.h5,
                  'CLASS', 'modal-title',
                  'ATTRS', 'popupelement="Title"',
                  'CONTENTS', (options.title || 'Title')
                ),
                o(m.button,
                  'CLASS', 'btn-close',
                  'ATTRS', 'type="button" '+
                    (options.nodefaultclose ? '' : 'data-bs-dismiss="modal"')+
                    ' aria-label="'+(options.closecaption || 'Close')+'" popupelement="Close"'
                )
              ]
            ),
            o(m.div,
              'CLASS', 'modal-body',
              'ATTRS', 'popupelement="Body"',
              'CONTENTS', options.caption || ''
            ),
            o(m.div,
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