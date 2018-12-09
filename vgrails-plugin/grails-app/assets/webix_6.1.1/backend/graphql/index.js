const fs = require("fs");
const path = require("path");
const { ApolloServer, makeExecutableSchema } = require("apollo-server-express");

const Datastore = require("nedb");
const bluebird = require("bluebird");

// graphql schema
const text = fs.readFileSync(path.join(__dirname, "schema.graphql"));
const typeDefs = text.toString("utf8");

// packages DB
const packages = new Datastore();
packages.insert(require("./data/packages.json"));
const products = new Datastore();
products.insert(require("./data/products.json"));
const categories = new Datastore();
categories.insert(require("./data/categories.json"));

// promisify DB API
bluebird.promisifyAll(Datastore.prototype);
bluebird.promisifyAll(packages.find().constructor.prototype);
bluebird.promisifyAll(products.find().constructor.prototype);
bluebird.promisifyAll(categories.find().constructor.prototype);



const resolvers = {
	Query: {
		getProduct: async (root, args) => {
			const data = await products.findOneAsync({ _id: args.id });
			data.id = data._id;
			return data;
		},
		getPackage: async (root, args) => {
			const data = await packages.findOneAsync({ _id: args.id });
			data.id = data._id;
			return data;
		},
		getCategories: async (root, args) => {
			let data = await categories.findAsync({ parent: args.id });
			data = data.map(a => { 
				a.id = a._id; 
				return a; 
			});
			return data;
		},
		getAllProducts: async () => {
			let data = await products.findAsync({});
			data = data.map(a => {
				a.packages = async () => resolvers.Query.getProduct(null, { product: a.id });
				a.id = a._id;
				return a;
			});
			return data;
		},
		getAllPackages: async (root, args) => {
			let data = await packages.findAsync(args.product ? { product_id: args.product} : {});
			data = data.map(a => { 
				a.id = a._id; 
				return a; 
			});
			return data;
		}
	},
	Mutation: {
		updatePackage: async (root, args) => {
			await packages.updateAsync({ _id:args.package.id }, { $set:{ name: args.package.name, url: args.package.url }});
			return resolvers.Query.getPackage(root, { id: args.package.id });
		},
		addProduct: async (root, args) => {
			const doc = await products.insertAsync({ name: args.product.name });
			return { status: true, id: doc._id };
		},
		updateProduct: async (root, args) => {
			await products.updateAsync({ _id:args.id }, { $set:{ name: args.product.name }});
			return { status: true };
		},
		deleteProduct: async (root, args) => {
			await products.removeAsync({ _id:args.id });
			return { status: true };
		}
	},
	Category: {
		kids: async(root) => {
			return resolvers.Query.getCategories(root, { id: root.id });
		}
	},
	Package: {
		product: async(root) => {
			return resolvers.Query.getProduct(root, { id: root.product_id });
		}
	},
	Product: {
		packages: async(root) => {
			return resolvers.Query.getAllPackages(root, { product: root.id });
		}
	}
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = function(app, root){

	const path = root + "/graphql";
	const gqlServer = new ApolloServer({ schema });
	gqlServer.applyMiddleware({ app, path });

};