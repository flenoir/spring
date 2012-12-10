var gui = require("nw.gui");
var _ = require("underscore");
var ccg = global.ccg;

var elementEditorCtrl = function ($scope) {
	$scope.data = global.editElement;
	$scope.originalNumber = $scope.data.number;
	global.editElement = false;
	$scope.previewChannel = global.previewChannel;

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

		if ($scope.data.type == "template") {
			ccg.getTemplateInfo($scope.data.src, function (err, data) {
				if (err) {
					alert("Error reading template data");
					return;
				}

				$scope.fields = data.fields;
				$scope.$apply();
			});
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
		global.editElementCallback($scope.originalNumber, $scope.data);
		if ($scope.clearOnClose) {
			ccg.clear($scope.previewChannel);
		}
		window.close();
	}

	$scope.cancel = function () {
		if ($scope.clearOnClose) {
			ccg.clear($scope.previewChannel);
		}
		window.close();
	};

	$scope.preview = function () {
		var data = $scope.data;

		if (data.type == "media") {
			ccg.play($scope.previewChannel, data.src, {loop: true});
			$scope.clearOnClose = true;
			return;
		}

		if (data.type == "template") {
			ccg.loadTemplate($scope.previewChannel, data.src, true, $scope.data.data);
			$scope.clearOnClose = true;
			return;
		}
	}
};