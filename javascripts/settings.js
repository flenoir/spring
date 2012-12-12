var  settingsCtrl = function ($scope) {
	$scope.data = global.settings;

	$scope.$watch("data", function () {
		global.settings = $scope.data;

		fs.writeFile("settings.json", JSON.stringify($scope.data), function (err) {
			if (err) {
				alert("Error saving settings file");
				return;
			}
		});
	}, true);

	$scope.done = function () {
		window.close();
	};
};