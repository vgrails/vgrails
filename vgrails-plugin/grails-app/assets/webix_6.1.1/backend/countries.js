const Datastore = require("nedb");
const bluebird = require("bluebird");

// packages DB
const countries = new Datastore();
countries.insert(require("./data/countries.json"));

// promisify DB API
bluebird.promisifyAll(Datastore.prototype);
bluebird.promisifyAll(countries.find().constructor.prototype);

// client side expects obj.id while DB provides obj._id
function fixID(a){
	a.id = a._id;
	delete a._id;
	return a;
}

module.exports = function(app, root){

	app.get(root + "/countries",async (req,res, next)=>{
		try {
			let docs;
			if (req.query.filter){
				// math by text
				docs = await countries.find({
					value: { $regex: new RegExp("^"+req.query.filter.value,"i") }
				}).limit(10).execAsync();
			} else {
				// return all
				docs = await countries.findAsync({});
			}
			res.send(docs.map(fixID));
		} catch(e){
			next(e);
		}
	});

};