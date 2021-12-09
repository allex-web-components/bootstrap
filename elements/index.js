function createElements (execlib, applib, mylib) {
  'use strict';

  require('./modalcreator')(execlib.lib, applib);
  require('./datamodalcreator')(execlib.lib, applib);
	require('./modalformcreator')(execlib, applib);
	require('./popupcreator')(execlib, applib, mylib);
	require('./questioncreator')(execlib, applib, mylib);
}
module.exports = createElements;
