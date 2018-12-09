const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const Busboy = require("busboy");

module.exports = function(app, root){

	// show all attachments
	app.get(root + "/upload/:id",(req, res) => {
		res.sendFile(__dirname + "/uploads/photos/"+req.params.id);
	});
	app.get(root + "/upload/:id/:name",(req, res) => {
		res.sendFile(__dirname + "/uploads/photos/"+req.params.id);
	});

	app.post(root + "/upload",(req,res)=>{
		var busboy = new Busboy({ headers: req.headers });
		var saveTo = "";
		var fileName = "";

		busboy.on("file", (field, file, name) => {
			fileName = path.basename(name);
			fileName = crypto.createHash("md5").update(fileName).digest("hex");

			saveTo = path.join(__dirname, "uploads", "photos", fileName);
			file.pipe(fs.createWriteStream(saveTo));
		});
		busboy.on("finish", function() {
			if (saveTo){
				let fileName = path.basename(saveTo);
				res.send({
					status: "server",
					value: fileName
				});
			}
		});

		return req.pipe(busboy);
	});
};