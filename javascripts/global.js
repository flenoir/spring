var gui = require("nw.gui");
var fs = require("fs");
var path = require("path");

var loadedWindow = function () {
	$(window).on("keydown", global.keyPress);
}

if (global.isRunning) {
	loadedWindow();
} else {
	global.isRunning = true;

	var CasparCG = require("caspar-cg");
	var ccg = global.ccg = new CasparCG();

	ccg.on("error", function (err) {
		console.log("Error:", err);
	});

	var defaultSettings = {
		casparCg: {
			address: "localhost",
			port: 5250
		},
		playout: {
			channel: 1,
			videoLayer: 1,
			templateBgLayer: 2,
			templateLayer: 3
		},
		preview: {
			enabled: true,
			channel: 2
		}
	};

	global.settingsPath = path.join(path.dirname(process.execPath), "settings.json");

	fs.exists(global.settingsPath, function (exists) {
		if (!exists) {
			global.settings = defaultSettings;

			console.log("path", process.execPath);

			fs.writeFile(global.settingsPath, JSON.stringify(defaultSettings), function (err) {
				if (err) {
					alert("Error saving settings file");
					return;
				}
			});
			return;
		}

		fs.readFile(global.settingsPath, function (err, data) {
			if (err ||!data) {
				alert("Error reading settings.json");
				global.settings = defaultSettings;
				return;
			}

			try {
				global.settings = JSON.parse(data);
			} catch (err) {
				alert("Error reading settings.json");
				global.settings = defaultSettings;
			}

			ccg.connect(global.settings.casparCg.address, global.settings.casparCg.port);
		});
	});

	global.keyPress = function (e) {
		// ctrl + F12
		if ((e.ctrlKey || e.metaKey) && e.keyCode == 123) {
			gui.Window.get(this).showDevTools();
			didAction = true;
		}
	};

	loadedWindow();
}

angular.module("cg", [])
	.directive("ngRightClick", function ($parse) {
		return function (scope, element, attr) {
			element.bind("contextmenu", function (event) {
				event.preventDefault();

				var fn = $parse(attr["ngRightClick"]);
				scope.$apply(function() {
					fn(scope, {
						$event: event
					});
				});
				return false;
			});
		};
	})
	.filter("timecode", function () {
		return function (input) {
			var time = new Date();
			time.setTime(Math.round(input / 30 * 1000));

			var out = "";
			out += ("00" + time.getUTCHours()).slice(-2) + ":";
			out += ("00" + time.getMinutes()).slice(-2) + ":";
			out += ("00" + time.getSeconds()).slice(-2) + ".";
			out += ("000" + time.getMilliseconds()).slice(-3);

			return out;
		};
	});

global.createId = function() {
	// If we have a cryptographically secure PRNG, use that
	// http://stackoverflow.com/questions/6906916/collisions-when-generating-uuids-in-javascript
	var buf = new Uint16Array(8);
	window.crypto.getRandomValues(buf);
	
	var S4 = function(num) {
		var ret = num.toString(16);
		while(ret.length < 4){
			ret = "0"+ret;
		}
		return ret;
	};

	return (S4(buf[0])+S4(buf[1])+"-"+S4(buf[2])+"-"+S4(buf[3])+"-"+S4(buf[4])+"-"+S4(buf[5])+S4(buf[6])+S4(buf[7]));
}
