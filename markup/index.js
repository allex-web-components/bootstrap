function createMarkups (execlib) {
  'use strict';
  var lib = execlib.lib,
    lR = execlib.execSuite.libRegistry,
    o = lR.get('allex_templateslitelib').override,
    m = lR.get('allex_htmltemplateslib'),
    s = lR.get('allex_svgtemplateslib'),
    mylib = {};

    require('./modal')(lib, o, m, mylib);
    require('./question')(lib, o, m, mylib);
    require('./toasts')(lib, o, m, s, mylib);

  return mylib;
}
module.exports = createMarkups;