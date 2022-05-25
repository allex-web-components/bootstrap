function createMixins (execlib) {
  var mylib = {};

  require('./tooltipablecreator')(execlib, mylib);
  require('./resurrectablecreator')(execlib, mylib);

  return mylib;
}
module.exports = createMixins;