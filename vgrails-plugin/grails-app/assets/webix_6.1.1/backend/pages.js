const Datastore = require("nedb");
const bluebird = require("bluebird");

// packages DB
const pages = new Datastore();
pages.insert(require("./data/pages.json"));

// promisify DB API
bluebird.promisifyAll(Datastore.prototype);
bluebird.promisifyAll(pages.find().constructor.prototype);

// client side expects obj.id while DB provides obj._id
function fixID(a){
	a.id = a._id;
	delete a._id;
	return a;
}

async function getPagesLevel(parent, kids){
	const docs = await pages.find({ parent }).sort({ title:1 }).execAsync();
	if (kids){
		for (const doc of docs){
			const sub = await getPagesLevel(doc._id, kids);
			if (sub)
				doc.data = sub;
		}
	}

	return docs.map(fixID);
}

module.exports = function(app, root){

	app.get(root + "/pages",async (req,res, next)=>{
		try {
			// return all
			const docs = await getPagesLevel("0", true);
			res.send({
				parent:"0",
				data:docs
			});
		} catch(e){
			next(e);
		}
	});


	app.post(root + "/pages", async (req, res, next) => {
		const title = req.body.title;
		const parent = req.body.parent;
		try {
			const doc = await pages.insertAsync({ parent, title });
			res.send({ id:doc._id });
		} catch(e){
			next(e);
		}
	});

	app.put(root + "/pages/:id", async (req, res, next) => {
		const id = req.params.id;
		const title = req.body.title;
		const parent = req.body.parent;

		try {
			await pages.updateAsync({ _id:id }, { $set:{ parent, title } });
			res.send({});
		} catch(e){
			next(e);
		}
	});

	app.delete(root + "/pages/:id", async (req, res, next) => {
		const id = req.params.id;
		try {
			await pages.removeAsync({ _id:id });
			res.send({});
		} catch(e){
			next(e);
		}
	});

};