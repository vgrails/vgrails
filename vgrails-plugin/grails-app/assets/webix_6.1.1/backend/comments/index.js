const Datastore = require("nedb");
const bluebird = require("bluebird");

// comments DB
const comments = new Datastore();
comments.insert(require("./data/comments.json"));

// users DB
const users = new Datastore();
users.insert(require("./data/users.json"));

// promisify DB API
bluebird.promisifyAll(Datastore.prototype);
bluebird.promisifyAll(comments.find().constructor.prototype);

// client side expects obj.id while DB provides obj._id
function fixID(a){
	a.id = a._id;
	delete a._id;
	return a;
}

module.exports = function(app, root){

	app.get(root + "/comments",async (req,res, next)=>{
		try {
			const docs = await comments.findAsync({});
			res.send(docs.map(fixID));
		} catch(e){
			next(e);
		}
	});

	app.get(root + "/comments_users",async (req,res, next)=>{
		try {
			const docs = await users.findAsync({});
			res.send(docs.map(fixID));
		} catch(e){
			next(e);
		}
	});

	app.get(root + "/comments_next", async (req,res, next) => {
		const pos =  req.query.pos*1;
		const more =  req.query.more*1;
		const chunk = 3;

		try {
			const docsCount = await comments.countAsync({});
			let docs = await comments.find({});
			let data;
			if(more){
				docs = await docs.skip(pos).limit(Math.min(more, chunk)).execAsync();
				data = {
					more:Math.max(more-chunk, 0),
					data:docs.map(fixID)
				}
			}
			else{
				docs = await docs.limit(chunk).execAsync();
				data = {
					more:docsCount-chunk,
					data:docs.map(fixID)
				};
			}
			res.send(data);

		} catch(e){
			next(e);
		}
	});

	app.get(root + "/comments_prev", async (req,res, next) => {
		const more =  req.query.more*1;
		const chunk = 3;

		try {
			const docsCount = await comments.countAsync({});
			const pos = Math.max(more-chunk, 0);
			let docs = await comments.find({});
			let data;
			if(more){
				docs = await docs.skip(pos).limit(Math.min(more, chunk)).execAsync();
				data = {
					more:pos,
					data:docs.map(fixID)
				}
			}
			else{
				docs = await docs.skip(docsCount-chunk).limit(chunk).execAsync();
				data = {
					more:docsCount-chunk,
					data:docs.map(fixID)
				};
			}
			res.send(data);

		} catch(e){
			next(e);
		}
	});


};