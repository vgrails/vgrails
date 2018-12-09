const Datastore = require("nedb");
const bluebird = require("bluebird");

// packages DB
const projects = new Datastore();
projects.insert(require("./data/projects.json"));

// promisify DB API
bluebird.promisifyAll(Datastore.prototype);
bluebird.promisifyAll(projects.find().constructor.prototype);

// client side expects obj.id while DB provides obj._id
function fixID(a){
	a.id = a._id;
	delete a._id;
	delete a.has_kids;
	return a;
}

async function getProjectsLevel(parent, kids){
	const docs = await projects.findAsync({ parent });
	if (kids){
		for (const doc of docs){
			const sub = await getProjectsLevel(doc._id, kids);
			if (sub)
				doc.data = sub;
		}
	} else {
		for (const doc of docs){
			if (doc.has_kids){
				// set dynamic loading flag for the client side
				doc.webix_kids = true;
			}
		}
	}

	return docs;
}

module.exports = function(app, root){

	app.get(root + "/projects",async (req,res, next)=>{
		try {
			// return all
			const docs = await getProjectsLevel(0, true);
			res.send({
				parent:0,
				data:docs.map(fixID)
			});
		} catch(e){
			next(e);
		}
	});

	app.get(root + "/projects_dynamic",async (req,res, next)=>{
		try {
			// return all
			const parent = parseInt(req.query.parent || 0); 
			const docs = await getProjectsLevel(parent, false);
			res.send({
				parent:parent,
				data:docs.map(fixID)
			});
		} catch(e){
			next(e);
		}
	});

};