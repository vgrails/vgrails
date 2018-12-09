module.exports = function(app, root){

	app.post(root + "/mirror",(req, res) => {
		res.send("<pre>"+JSON.stringify(req.body, "", "\t")+"</pre>");
	});
	
	app.get(root + "/mirror",(req, res) => {
		res.send("<pre>"+JSON.stringify(req.query, "", "\t")+"</pre>");
	});


};