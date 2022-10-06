function createModalMarkups(lib, o, m, mylib) {
  'use strict';

  function modalMarkup (options) {
    options = options||{};
    return o(m.div,
      'CLASS', 'modal' + (options.class ? ' '+options.class : ''),
      'ATTRS', options.attrs || '',
      'CONTENTS', o(m.div,
        'CLASS', lib.joinStringsWith(
          lib.joinStringsWith('modal-dialog', options.centered ? 'modal-dialog-centered' : '', ' '),
          options.dialogclass,
          ' '
        ),
        'ATTRS', options.dialogattrs || '',
        'CONTENTS', o(m[options.dialogelement || 'div'],
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