var gui = require("nw.gui");
var _ = require("underscore");
var fs = require("fs");
var ccg;

var elementsCtrl = function ($scope) {
	ccg = global.ccg;
	$scope.elements = [];
	$scope.channel = "1-1";
	$scope.previewChannel = "2-1";
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
	};

	var getElement = function (number) {
		var index = getElementIndex(number);
		if (index == -1) return false;

		return $scope.elements[index];
	};

	var setElement = function (number, data) {
		var index = getElementIndex(number);

		if (index == -1) {
			$scope.elements.push(data);
		} else {
			$scope.elements[index] = data;
		}
	};

	var getNextNumber = function (number) {
		while (getElement(number) != false) {
			number++;
		}

		return number;
	};

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

	global.editElementCallback = function (isNew, data) {
		if (isNew) {
			$scope.elements.push(data);
			console.log("is new");
		}
		$scope.$apply();
	}

	$scope.editElement = function (element) {
		global.editElement = element;

		var newWin = gui.Window.get(window.open("elementEditor.html"));
		newWin.setMinimumSize(400, 340);
		newWin.resizeTo(550, 400);
		newWin.setPosition("center");
	}

	$scope.newElement = function () {
		global.isNewElement = true;
		$scope.editElement({
			number: getNextNumber($scope.selectedElement | 100)
		});
	};

	$scope.deleteElement = function (number) {
		$scope.elements.splice(getElementIndex(number), 1);
		$scope.$apply();
	};

	$scope.runElement = function (number) {
		var data = getElement(number);

		if (!data) return;

		if (data.type == "media") {
			ccg.play($scope.channel, data.src);
			$scope.clearOnClose = true;
			return;
		}

		if (data.type == "template") {
			ccg.loadTemplate($scope.channel, data.src, true, data.data);
			$scope.clearOnClose = true;
			return;
		}
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

	$scope.loadNumber = "";
	var numberTimer = false;

	$("body").on("keyup", function (event) {
		// check for numeric keypad
		if (event.keyCode >= 96 && event.keyCode <= 105) {
			var number = event.keyCode - 96;

			$scope.loadNumber += "" + number;
			$scope.$apply();

			if (numberTimer) clearTimeout(numberTimer);
			numberTimer = setTimeout(function () {
				$scope.loadNumber = "";
				$scope.$apply();
			}, 1500);

			event.preventDefault();
			return;
		}

		switch (event.keyCode) {
			// del - clear number
			case 110:
				if (numberTimer) clearTimeout(numberTimer);

				$scope.loadNumber = "";
				$scope.$apply();
				event.preventDefault();
				break;
			// enter - select
			case 13:
				if (numberTimer) clearTimeout(numberTimer);

				$scope.selectedElement = parseInt($scope.loadNumber, 10);
				$scope.loadNumber = "";
				$scope.$apply();
				event.preventDefault();
				break;
			// + - run selected
			case 107:
				$scope.runElement($scope.selectedElement);
				break;
			// - - cue selected
			case 109:
				var data = getElement($scope.selectedElement);

				if (!data) break;

				if (data.type == "media") {
					ccg.loadBg($scope.channel, data.src, {auto: true});
					$scope.clearOnClose = true;
					return;
				}

				if (data.type == "template") {
					ccg.loadTemplate($scope.channel, data.src, false, data.data);
					$scope.clearOnClose = true;
					return;
				}
				break;
			// F5 - play
			case 116:
				break;
			// F6 - stop
			case 117:
				ccg.stopTemplate($scope.channel);
				break;
			// F7 - next
			case 118:
				ccg.advanceTemplate($scope.channel);
				break;
			// F8 - clear
			case 119:
				ccg.clear($scope.channel);
				break;
		}
	});

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