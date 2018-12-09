const Datastore = require("nedb");
const bluebird = require("bluebird");

// packages DB
const packages = new Datastore();
packages.insert(require("./data/packages.json"));

// promisify DB API
bluebird.promisifyAll(Datastore.prototype);
bluebird.promisifyAll(packages.find().constructor.prototype);

// client side expects obj.id while DB provides obj._id
function fixID(a){
	a.id = a._id;
	delete a._id;
	return a;
}

module.exports = function(app, root){

	app.get(root + "/packages",async (req,res, next)=>{
		try {
			const docs = await packages.findAsync({});
			res.send(docs.map(fixID));
		} catch(e){
			next(e);
		}
	});

	app.get(root + "/packages_part",async (req,res, next)=>{
		try {
			let docs = packages.find({});
			if (req.query.start) docs = docs.skip(req.query.start);
			if (req.query.count) docs = docs.limit(req.query.count);
			docs = await docs.execAsync();
			
			res.send(docs.map(fixID));
		} catch(e){
			next(e);
		}
	});

	app.get(root + "/packages_dynamic", async (req,res, next) => {
		const start =  req.query.start || 0;
		const count =  req.query.count || 50;

		try {
			const docsCount = await packages.countAsync({});
			const docs = await packages.find({}).skip(start).limit(count).execAsync();

			const data = {
				pos: start, 
				total_count: docsCount,
				data: docs.map(fixID)
			};
			res.send(data);
		} catch(e){
			next(e);
		}
	});

	app.get(root + "/packages_full", async (req,res, next) => {
		const start =  req.query.start || 0;
		const count =  req.query.count || 50;

		try {
			const docsCount = await packages.countAsync({});
			let docs = await packages.find({}).skip(start).limit(count)
			
			if (req.query.sort){
				const sort = req.query.sort;
				for (var key in sort)
					sort[key] = sort[key] === "asc" ? 1 : -1;
				docs = docs.sort(sort);
			}

			docs = await docs.execAsync();

			const data = {
				pos: start, 
				total_count: docsCount,
				data: docs.map(fixID)
			};
			res.send(data);
		} catch(e){
			next(e);
		}
	});

};