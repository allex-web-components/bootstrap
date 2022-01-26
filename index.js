(function (execlib) {
  var lib = execlib.lib,
    lR = execlib.execSuite.libRegistry,
    applib = lR.get('allex_applib'),
    mylib = {};

  mylib.markups = require('./markup')(execlib);
  mylib.jobs = require('./jobs')(execlib);
  require('./elements')(execlib, applib, mylib);

  lR.register('allex_bootstrapwebcomponent', mylib);
})(ALLEX)
