function createJobs (execlib) {
  'use strict';
  var mylib = {
    question2function: require('./question2functioncreator')(execlib.lib)
  };

  return mylib;
}
module.exports = createJobs;