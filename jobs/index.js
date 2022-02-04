function createJobs (execlib) {
  'use strict';
  var mylib = {
    question2function: require('./question2function')(execlib)
  };

  return mylib;
}
module.exports = createJobs;