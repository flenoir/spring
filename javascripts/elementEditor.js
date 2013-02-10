var gui = require("nw.gui");
var _ = require("underscore");
var ccg = global.ccg;

var elementEditorCtrl = function ($scope) {
	$scope.data = global.editElement;
	$scope.isNew = global.isNewElement;
	global.editElement = false;
	global.isNewElement = false;

	$scope.isPreviewEnabled = function () {
		return (global.settings.preview.enabled);
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

		if ($scope.data.type == "template") {
			ccg.getTemplateInfo($scope.data.src, function (err, data) {
				if (err) {
					alert("Error reading template data");
					return;
				}

				$scope.fields = data.fields;

				if (!$scope.data.data) {
					$scope.data.data = {};
				}

				$scope.$apply();
			});
		} else {
			if ($scope.data.data) {
				delete $scope.data.data;
			}
		}
	});

	$scope.$watch("data.name", function () {
		document.title = "Edit - " + $scope.data.name;
	});

	$scope.done = function () {
		global.editElementCallback($scope.isNew, $scope.data);

		if ($scope.clearOnClose) {
			ccg.clear(global.settings.preview.channel);
		}

		window.close();
	};

	$scope.cancel = function () {
		if ($scope.clearOnClose) {
			ccg.clear(global.settings.preview.channel);
		}

		window.close();
	};

	$scope.preview = function () {
		var data = $scope.data;

		if (data.type == "media") {
			ccg.play(global.settings.preview.channel, data.src, {loop: true});
			$scope.clearOnClose = true;
			return;
		}

		if (data.type == "template") {
			ccg.loadTemplate(global.settings.preview.channel, data.src, true, data.data);
			$scope.clearOnClose = true;
			return;
		}
	};
};