function createMixins (execlib) {
  var mylib = {};

  require('./tooltipablecreator')(execlib, mylib);

  return mylib;
}
module.exports = createMixins;