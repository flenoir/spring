var ccg = global.ccg;
var gui = require("nw.gui");

var win = gui.Window.get();
win.moveTo(0,0);

win.on("focus", function () {
	global.libraryWindow.focus();
});

var statusCtrl = function ($scope) {

	$scope.getInfo = function () {
		var self = this;

		ccg.info("1", function (err, info) {
			setTimeout($scope.getInfo, 100);

			if (err || !info || !info.layers) return;

			$scope.layers = info.layers;
			$scope.$apply();

		});
	};

	$scope.getInfo();
};
