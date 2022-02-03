function createQuestion2FunctionJobs (lib) {
  'use strict';

  var mylib = {mixins:{}};
  require('./basecreator')(lib, mylib);
  require('./predefinedcreator')(lib, mylib);
  require('./paramcreator')(lib, mylib);
  require('./simpleinputcreator')(lib, mylib);

  return mylib;

}
module.exports = createQuestion2FunctionJobs;