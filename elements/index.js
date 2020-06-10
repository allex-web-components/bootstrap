function createElements (lib, applib) {
  'use strict';

  require('./modalcreator')(lib, applib);
  require('./datamodalcreator')(lib, applib);
}
module.exports = createElements;
