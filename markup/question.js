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

  function questionButtonsCreator (buttondescriptors) {
    return buttondescriptors.map(function (butdesc) {
      return o(m.div,
        'CLASS', lib.joinStringsWith('btn', butdesc.class, butdesc.primary? 'btn-primary' : 'btn-secondary', ' '),
        'ATTRS', lib.joinStringsWith('type="button"', butdesc.attrs, butdesc.closer ? 'data-bs-dismiss="modal"' : '', ' '),
        'CONTENTS', butdesc.caption
      )
    })
  }

  mylib.questionBodyCreator = questionBodyCreator;
  mylib.questionButtonsCreator = questionButtonsCreator;
}
module.exports = createQuestionMarkups;