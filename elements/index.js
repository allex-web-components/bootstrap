function createElements (execlib, applib, mylib) {
  'use strict';

  require('./modalcreator')(execlib.lib, applib, mylib);
  require('./datamodalcreator')(execlib.lib, applib);
	require('./modalformcreator')(execlib, applib);
  require('./offcanvascreator')(execlib.lib, applib);
	require('./popupcreator')(execlib, applib, mylib);
	require('./questioncreator')(execlib, applib, mylib);
	require('./textinputwithlistcreator')(execlib, applib, mylib);
	require('./serverlookupcreator')(execlib, applib, mylib);
	require('./customselectcreator')(execlib, applib, mylib);
	require('./toastscreator')(execlib, applib, mylib);
}
module.exports = createElements;
