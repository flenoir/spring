var gui = require("nw.gui");

var loadedWindow = function () {
	$(window).on("keydown", global.keyPress);
}

$(document).ready(function () {
	if (global.isRunning) {
		loadedWindow();
		return;
	}
	global.isRunning = true;

	var CasparCG = require("caspar-cg");
	var ccg = global.ccg = new CasparCG("localhost", 5250);

	ccg.on("error", function (err) {
		console.log("Error:", err);
	});

	ccg.connect();

	global.keyPress = function (e) {
		var didAction = false;
		// num pad / and num pad *
		if (e.keyCode == 111 || e.keyCode == 106) {
		}

		// F12
		if (e.keyCode == 123) {
			gui.Window.get(this).showDevTools();
			didAction = true;
		}

		// ctrl+n or cmd+n
		if ((e.ctrlKey || e.metaKey) && e.keyCode == 78) {
		}

		if (didAction) {
			e.preventDefault();
			return false;
		}
	};


	loadedWindow();
});

angular.module("cg", []).directive("ngRightClick", function ($parse) {
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