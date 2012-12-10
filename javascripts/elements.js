var gui = require("nw.gui");
var _ = require("underscore");
var fs = require("fs");

var elementsCtrl = function ($scope) {
	$scope.elements = [];
	$scope.channel = "2-1";
	$scope.previewChannel = "1-1";
	$scope.filePath = false;
	$scope.sort = function (item) {
		console.log(item);
		return parseInt(item.number, 10);
	};

	$scope.$watch("previewChannel", function () {
		global.previewChannel = $scope.previewChannel;
	});

	$scope.newFile = function () {
		$scope.filePath = false;
		$scope.elements = [];
		$scope.$apply();
	}

	$scope.openFile = function (path) {
		if (!path) {
			var chooser = $("input#open");
			chooser.click();
			chooser.change(function () {
				$scope.openFile($(this).val());
			});
			return;
		}

		$scope.filePath = path;
		fs.readFile($scope.filePath, function (err, data) {
			if (err || !data) {
				console.log(err);
				alert("Error opening file " + path);
				return;
			}

			try {
				data = JSON.parse(data);
			} catch (err) {
				alert("Error reading file");
				return;
			}

			$scope.elements = data.elements;
			$scope.savedElements = angular.copy($scope.elements);
			$scope.$apply();
		});
	};

	$scope.saveFile = function () {
		if (!$scope.filePath) {
			var chooser = $("input#saveAs");
			chooser.click();
			chooser.change(function () {
				$scope.filePath = $(this).val();
				$scope.saveFile();
			});
			return;
		}

		var data = {
			elements: $scope.elements
		};

		data = JSON.stringify(data);

		fs.writeFile($scope.filePath, data, function (err) {
			if (err) {
				alert("Error saving file");
				return;
			}

			$scope.savedElements = angular.copy($scope.elements);
			$scope.$apply();
		});
	};

	var getElementIndex = function (number) {
		for (var index in $scope.elements) {
			if ($scope.elements[index].number == number) {
				return index;
			}
		}

		return -1;
	}

	var getElement = function (number) {
		var index = getElementIndex(number);
		if (index == -1) return false;

		return $scope.elements[index];
	};

	var setElement = function (number, data) {
		var index = getElementIndex(number);

		if (!index) return;

		$scope.elements[index] = data;
	}

	var getNextNumber = function (number) {
		while (getElement(number) != false) {
			number++;
		}

		return number;
	}

	$scope.saveFileAs = function () {
		$scope.filePath = false;
		$scope.saveFile();
	};

	var elementContextMenu = new gui.Menu();
	elementContextMenu.append(new gui.MenuItem({label: "Edit Element", click: function () {
		$scope.editElement($scope.elementContextMenuNumber);
		$scope.elementContextMenuNumber = false;
	}}));
	elementContextMenu.append(new gui.MenuItem({label: "Delete Element", click: function () {
		$scope.deleteElement($scope.elementContextMenuNumber);
		$scope.elementContextMenuNumber = false;
	}}));

	$scope.selectElement = function (number) {
		$scope.selectedElement = number;
	}

	$scope.elementContextMenu = function (event, number) {
		$scope.elementContextMenuNumber = number;
		elementContextMenu.popup(event.clientX, event.clientY);
	};

	global.editElementCallback = function (originalNumber, data) {
		setElement(originalNumber, data);
		$scope.$apply();
	}

	$scope.editElement = function (element) {
		if (typeof(element) != "object") {
			console.log("get element", element);
			element = getElement(element);
			console.log("got element", element);
		}

		global.editElement = element;

		var newWin = gui.Window.get(window.open("elementEditor.html"));
		newWin.setMinimumSize(400, 340);
		newWin.resizeTo(550, 400);
		newWin.setPosition("center");
	}

	$scope.newElement = function () {
		$scope.editElement({
			number: getNextNumber($scope.selectedElement | 100)
		});
	};

	$scope.deleteElement = function (number) {
		$scope.elements.splice(getElementIndex(number), 1);
		$scope.$apply();
	};


	var menu = new gui.Menu({type: "menubar"});
	var fileMenu  = new gui.Menu();
	var editMenu  = new gui.Menu();
	menu.append(new gui.MenuItem({label: "File", submenu: fileMenu}));
	menu.append(new gui.MenuItem({label: "Edit", submenu: editMenu}));
	fileMenu.append(new gui.MenuItem({
		label: "New",
		click: $scope.newFile
	}));
	fileMenu.append(new gui.MenuItem({
		label: "Open",
		click: $scope.openFile
	}));
	fileMenu.append(new gui.MenuItem({
		label: "Save",
		click: $scope.saveFile
	}))
;	fileMenu.append(new gui.MenuItem({
		label: "Save As",
		click: $scope.saveFileAs
	}));
	editMenu.append(new gui.MenuItem({
		label: "New Element",
		click: $scope.newElement
	}));
	editMenu.append(new gui.MenuItem({type: "separator"}));
	editMenu.append(new gui.MenuItem({label: "Settings"}));

	gui.Window.get().menu = menu;

	if (gui.App.argv) {
		var path = gui.App.argv[0];

		if (path[0] == "\"") {
			path = gui.App.argv.join(" ");
			path = path.replace(/\"/g, "");
		}

		$scope.openFile(path);
	}

	gui.App.on("open", function (e) {
		$scope.openFile(e);
	});
};