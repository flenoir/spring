var gui = require("nw.gui");
var _ = require("underscore");

var elementEditorCtrl = function ($scope) {
	$scope.data = global.editElement;
	$scope.id = global.editElementId;
	global.editElement = false;
	global.editElementId = false;


	if (!$scope.data) {
		$scope.data = {
			number: 100
		};

		$scope.id = global.createId();
	}

	$scope.done = function () {
		global.editElementCallback($scope.id, $scope.data);
		window.close();
	}

	$scope.cancel = function () {
		window.close();
	};
};