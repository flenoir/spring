var fs = require("fs");
var path = require("path");
var async = require("async");
var jade = require("jade");
var stylus = require("stylus");

var paths = {
	stylus: {src: "./styles", dest: "./build/styles"},
	jade: {src: "./views", dest: "./build"},
	javascripts: {src: "./javascripts", dest: "./build/javascripts"},
	public: {src: "./public", dest: "./build"},
	package: {src: ["./build", "./node_modules"], dest: "./spring.zip"}
};

var isWin = !!process.platform.match(/^win/);

desc("Build and run app");
task("default", ["build:jade", "build:stylus", "build:public", "run"], {async: true});

desc("Run app");
task("run", function () {
	var cmd;

	if (!isWin) {
		cmd = ["open -n -a /Applications/node-webkit.app \"./\""];
	} else {
		cmd = [
			"nw.exe"
		];
	}

	jake.exec(cmd, complete);
}, {async: true});

desc("Build app");
task("build", ["build:jade", "build:stylus", "build:public"]);

desc("Clean build directory");
task("clean", function () {
	var cmd = "rm -rf " + paths["public"].dest + "/*";

	jake.exec([cmd], function () {
		jake.logger.log("Cleaned project");
		complete();
	})
}, {async: true});

namespace("build", function () {
	desc("Build jade");
	task("jade", function () {
		var build = function (folder, cb) {
			if (!cb) {
				cb = folder;
				folder = false;
			}

			var src = paths.jade.src;
			var dest = paths.jade.dest;

			if (folder) {
				src = path.join(src, folder);
				dest = path.join(dest, folder);
			}

			if (!fs.existsSync(dest)) {
				fs.mkdir(dest);
			}

			var files = fs.readdirSync(src);

			async.forEach(files, function (file, cb1) {
				if (file.indexOf("_") > -1 || file == "layout.jade") {
					jake.logger.log("Skipping " + path.join(src, file));
					cb1();
					return;
				}

				if (fs.statSync(path.join(src, file)).isDirectory()) {
					build(path.join(folder, file), cb1);
					return;
				}

				if (path.extname(file) != ".jade") {
					cb1();
					return;
				}

				var data = fs.readFileSync(path.join(src, file)).toString();
				jade.render(data, {
					pretty: true,
					filename: path.join(src, file),
					compileDebug: true
				}, function (err, html) {
					if (err) {
						jake.logger.log("Jade Error: " + err);
					}

					jake.logger.log(path.join(dest, file.replace(".jade", ".html")));
					fs.writeFile(path.join(dest, file.replace(".jade", ".html")), html, cb1);
				});
			}, cb);
		}

		build(complete);
	}, {async: true});

	desc("Build stylus");
	task("stylus", function () {
		var includePaths = [];
		var build = function (folder, cb) {
			if (!cb) {
				cb = folder;
				folder = false;
			}

			var src = paths.stylus.src;
			var dest = paths.stylus.dest;

			if (folder) {
				src = path.join(src, folder);
				dest = path.join(dest, folder);
			}

			includePaths.push(src);

			if (!fs.existsSync(dest)) {
				fs.mkdir(dest);
			}

			var files = fs.readdirSync(src);

			async.forEach(files, function (file, cb1) {
				if (file.indexOf("_") > -1) {
					jake.logger.log("Skipping " + path.join(src, file));
					cb1();
					return;
				}

				if (fs.statSync(path.join(src, file)).isDirectory()) {
					build(path.join(folder, file), cb1);
					return;
				}

				if (path.extname(file) != ".styl") {
					cb1();
					return;
				}

				var data = fs.readFileSync(path.join(src, file)).toString();
				var parser = stylus(data, {
					compress: false,
					paths: includePaths
				});

				parser.render(function (err, css) {
					if (err) {
						jake.logger.log("Stylus Error: " + err);
					}

					jake.logger.log(path.join(dest, file.replace(".styl", ".css")));
					fs.writeFile(path.join(dest, file.replace(".styl", ".css")), css, cb1);
				});
			}, cb);
		};

		build(complete);
	}, {async: true});

	desc("Copy public files");
	task("public", function () {
		if (!fs.existsSync(paths["public"].dest)) {
			fs.mkdir(paths["public"].dest);
		}

		if (!fs.existsSync(paths["javascripts"].dest)) {
			fs.mkdir(paths["javascripts"].dest);
		}

		var cmd = [];
		if (isWin) {
			cmd.push("xcopy " + paths["public"].src.replace(/\//g, "\\") + "\\* " + paths["public"].dest.replace(/\//g, "\\") + "\\ /E /C /R /K /Y");
			cmd.push("xcopy " + paths["javascripts"].src.replace(/\//g, "\\") + "\\* " + paths["javascripts"].dest.replace(/\//g, "\\") + "\\ /E /C /R /K /Y");
		} else {
			cmd.push("cp -rf" + paths["public"].src + "/* " + paths["public"].dest + "/");
			cmd.push("cp -rf" + paths["javascripts"].src + "/* " + paths["javascripts"].dest + "/");
		}

		jake.exec(cmd, function () {
			jake.logger.log("Coppied public files");
			complete();
		});
	}, {async: true});

	desc("Package app");
	task("package", function () {
		var zip = require("node-native-zip");
		var archive = new zip();

		var build = function (root, folder, cb) {
			if (!cb) {
				cb = folder;
				folder = false;
			}

			var src = root;

			if (folder) {
				src = path.join(src, folder);
			}

			var files = fs.readdirSync(src);

			async.forEach(files, function (file, cb1) {
				if (file.substr(0, 1) == ".") {
					jake.logger.log("Skipping " + path.join(src, file));
					cb1();
					return;
				}

				if (fs.statSync(path.join(src, file)).isDirectory()) {
					console.log("get folder ", path.join(src, file));
					build(root, path.join(folder, file), cb1);
					return;
				}

				console.log("get file ", path.join(folder, file), path.join(src, file));

				archive.add(path.join(folder, file), fs.readFileSync(path.join(src, file)));

				cb1();
			}, cb);
		};

		async.forEach(paths.package.src, function (src, cb) {
			build("./", src, cb);
		}, function () {
			archive.add("package.json", fs.readFileSync("./package.json"));

			var data = archive.toBuffer();

			fs.writeFile(paths.package.dest, data, function () {
				jake.exec(["copy /b nw.exe+spring.zip spring.exe"], complete);
			});
		});
	}, {async: true});

});
