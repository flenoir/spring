var gui = require("nw.gui");
var _ = require("underscore");
var ccg = global.ccg;

var elementEditorCtrl = function ($scope) {
	$scope.data = global.editElement;
	$scope.id = global.editElementId;
	global.editElement = false;
	global.editElementId = false;
	$scope.previewChannel = global.previewChannel;

	if (!$scope.data) {
		$scope.data = {
			number: 100,
			data: {f0: "f0 value", f1: "f1 value"}
		};

		$scope.id = global.createId();
	}

	$scope.types = {
		"media": "Media",
		"template": "Template"
	};

	ccg.getMediaFiles(function (err, results) {
		$scope.mediaFiles = results;
		$scope.$apply();
	});

	ccg.getTemplates(function (err, results) {
		$scope.templateFiles = results;
		$scope.$apply();
	});

	$scope.$watch("data.src", function (newVal, oldVal) {
		if (!$scope.data.name || $scope.data.name == "" || $scope.data.name == oldVal) {
			$scope.data.name = $scope.data.src;
		}
	});

	$scope.addData = function () {
		if (!$scope.newKey || $scope.newKey === "") {
			return;
		}

		if (!$scope.data.data) {
			$scope.data.data = {};
		}

		if (!$scope.templateData) {
			$scope.templateData = [];
		}

		$scope.data.data[$scope.newKey] = $scope.newValue;

		$scope.newKey = "";
		$scope.newValue = "";
	};

	$scope.removeData = function (key) {
		delete $scope.data.data[key];
	};

	$scope.done = function () {
		global.editElementCallback($scope.id, $scope.data);
		window.close();
	}

	$scope.cancel = function () {
		window.close();
	};

	$scope.preview = function () {
		var data = $scope.data;

		if (data.type == "media") {
			ccg.play($scope.previewChannel, data.src, {loop: true});
			return;
		}

		if (data.type == "template") {
			ccg.loadTemplate($scope.previewChannel, data.src, true, $scope.data.data);
			return;
		}
	}
};