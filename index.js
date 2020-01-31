(function (execlib) {
  var lib = execlib.lib,
    lR = execlib.execSuite.libRegistry,
    applib = lR.get('allex_applib');

  require('./elements')(lib, applib);
})(ALLEX)
