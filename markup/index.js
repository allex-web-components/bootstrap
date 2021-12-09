function createMarkups (execlib) {
  'use strict';
  var lib = execlib.lib,
    lR = execlib.execSuite.libRegistry,
    o = lR.get('allex_templateslitelib').override,
    m = lR.get('allex_htmltemplateslib'),
    mylib = {};

    require('./modal')(lib, o, m, mylib);
    require('./question')(lib, o, m, mylib);

  return mylib;
}
module.exports = createMarkups;