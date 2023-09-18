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

  function questionWithInputBodyCreator (config) {
    var caption;
    config = config || {};
    caption = config.caption;
    return o(m.div,
      'CLASS', 'questionbody',
      'CONTENTS', [
        o(m.div
          , 'CLASS', 'mb-2'
          , 'CONTENTS', caption
        ),
        o(m[(config.inputtype||'text')+'input']
          , 'CLASS', 'form-control justtext'
          , 'ATTRS', config.inputattrs||''
        )
      ]
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
  mylib.questionWithInputBodyCreator = questionWithInputBodyCreator;
  mylib.questionButtonsCreator = questionButtonsCreator;
}
module.exports = createQuestionMarkups;