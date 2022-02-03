function createJobs (execlib) {
  'use strict';
  var mylib = {
    question2function: require('./question2function')(execlib.lib)
  };

  return mylib;
}
module.exports = createJobs;