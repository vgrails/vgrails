const Datastore = require("nedb");
const bluebird = require("bluebird");

// packages DB
const films = new Datastore();
films.insert(require("./data/films.json"));

// promisify DB API
bluebird.promisifyAll(Datastore.prototype);
bluebird.promisifyAll(films.find().constructor.prototype);

// client side expects obj.id while DB provides obj._id
function fixID(a){
	a.id = a._id;
	delete a._id;
	return a;
}

module.exports = function(app, root){

	app.get(root + "/films",async (req, res, next)=>{
		try {
			const docs = await films.findAsync({});
			res.send(docs.map(fixID));
		} catch(e){
			next(e);
		}
	});

	app.get(root + "/films/:id",async (req, res, next)=>{
		try {
			const docs = await films.findAsync({ _id: req.params.id });
			res.send(docs.map(fixID));
		} catch(e){
			next(e);
		}
	});

	app.get(root + "/films_ordered",async (req, res, next)=>{
		try {
			const docs = await films.find({}).sort({ rank:1 }).execAsync();
			res.send(docs.map(fixID));
		} catch(e){
			next(e);
		}
	});

	app.get(root + "/films_sortfilter",async (req, res, next)=>{
		try {
			const filter = req.query.filter;
			const sort = req.query.sort;

			let where = {};
			if (filter && filter.year)
				where.year = filter.year;
			if (filter && filter.title)
				where.title = { $regex: new RegExp(`^${filter.title}`,"i") };

			let docs = films.find(where);

			if (sort){
				for (var key in sort){
					sort[key] = sort[key] === "asc" ? 1 : -1;
					docs = docs.sort(sort);
				}
			}
			
			docs = await docs.execAsync();
			res.send(docs.map(fixID));
		} catch(e){
			next(e);
		}
	});


	app.post(root + "/films", async (req, res, next) => {
		try {
			const doc = await films.insertAsync({
				title: req.body.title,
				year: req.body.year,
				votes: req.body.votes,
				rating: req.body.rating,
				rank: req.body.rank
			});
			res.send({ id: doc._id });
		} catch(e){
			next(e);
		}
	});

	app.put(root + "/films/:id", async (req, res, next) => {
		try {
			await films.updateAsync({ _id: req.params.id }, {
				$set:req.body
			});
			res.send({ status: "updated" }); // status is optional, used by one of samples
		} catch(e){
			next(e);
		}
	});

	app.delete(root + "/films/:id", async (req, res, next) => {
		try {
			await films.removeAsync({ _id: req.params.id });
			res.send({});
		} catch(e){
			next(e);
		}
	});

	app.put(root + "/films_ordered/:id", async function(req, res, next){
		try {
			const id = req.params.id;
			const new_rank = parseInt(req.body.rank);
			const old_rank = parseInt(req.body.old_rank);

			await films.updateAsync({ rank: { $gte: old_rank }}, { $inc:{ rank: -1 }}, { multi: true });
			await films.updateAsync({ rank: { $gte: new_rank }}, { $inc:{ rank: 1 }}, { multi: true });
			await films.updateAsync({ _id: id }, { $set:{ rank: new_rank }});

			res.send({});
		} catch(e){
			next(e);
		}
	});

};