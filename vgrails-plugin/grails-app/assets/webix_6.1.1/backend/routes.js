module.exports = function(app){

	const root = "/samples/server";

	// uploader
	require("./uploader")(app, root);

	// dataview, datatable
	require("./packages")(app, root);
	require("./films")(app, root);

	// combo, select
	require("./countries")(app, root);

	// tree
	require("./projects")(app, root);
	require("./pages")(app, root);

	// common
	require("./syntetic")(app, root);
	require("./mirror")(app, root);

	// graphql
	require("./graphql/index")(app, root);

	//comments
	require("./comments/index")(app, root);
};