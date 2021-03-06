var gui = require("nw.gui");
var _ = require("underscore");
var fs = require("fs");
var ccg;
var ApiServer = require("./javascripts/apiServer");
var apiServer = new ApiServer();

var elementsCtrl = function ($scope) {
	ccg = global.ccg;
	$scope.elements = [];
	$scope.filePath = false;
	$scope.autoPreview = true;
	$scope.selectedElement = -1;

	$scope.isPreviewEnabled = function () {
		return (
			global.settings &&
			global.settings.preview &&
			global.settings.preview.enabled
		);
	}

	$scope.sort = function (item) {
		console.log(item);
		return parseInt(item.number, 10);
	};

	$scope.newFile = function () {
		$scope.filePath = false;
		$scope.elements = [];
		$scope.$apply();
	};

	apiServer.start();
	apiServer.on("newElements", function (newElements) {
		console.log("new elements", newElements);

		_.each(newElements, function (element) {
			element.temp = true;
			var existingElement = getElement(element.number);

			if (existingElement && !existingElement.temp) {
				console.log("API Conflict with exisitng element ", element.number);
				return;
			}

			if (existingElement) {
				var index = getElementIndex(element.number);
				$scope.elements[index] = element;
				return;
			}

			$scope.elements.push(element);
		});
		$scope.$apply();
	});

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

			localStorage.openFile = $scope.filePath;
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

		var elements = _.filter($scope.elements, function (element) {
			return (!element.temp);
		});

		var data = {
			elements: $scope.elements
		};

		data = angular.toJson(data);

		fs.writeFile($scope.filePath, data, function (err) {
			if (err) {
				alert("Error saving file");
				return;
			}

			$scope.savedElements = angular.copy($scope.elements);
			$scope.$apply();
		});
	};

	$scope.removeTempElements = function () {
		var removeNumbers = [];

		_.each($scope.elements, function (element) {
			if (element.temp) {
				removeNumbers.push(element.number);
			}
		});

		_.each(removeNumbers, function(number) {
			$scope.elements.splice(getElementIndex(number), 1);
		});

		$scope.$apply();
	}

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
		console.log(number);
		while (getElementIndex(number) != -1) {
			console.log(number, getElementIndex(number));
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

	$scope.selectElement = function (number, event) {
		if (event) event.stopPropagation();
		$scope.selectedElement = number;

		if ($scope.isPreviewEnabled && $scope.autoPreview) {
			var data = getElement(number);

			if (!data) {
				ccg.clear(global.settings.preview.channel + "-1");
				return;
			}

			if (data.type == "media") {
				ccg.play(global.settings.preview.channel + "-1", data.src, {loop: true});
				$scope.clearOnClose = true;
				return;
			}

			if (data.type == "template") {
				ccg.loadTemplate(global.settings.preview.channel + "-1", data.src, true, data.data);
				$scope.clearOnClose = true;
				return;
			}
		}
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
	};

	$scope.editElement = function (event, element) {
		if (!element) {
			element = event;
			event = null;
		} else {
			event.stopPropagation();
			event.preventDefault();
		}

		global.editElement = element;

		var newWin = gui.Window.open("elementEditor.html",{
			position: "center",
			toolbar: false,
			width: 550,
			height: 320,
			min_width: 550,
			max_width: 551,
			min_height: 300,
			max_height: 800
		});
	};

	$scope.newElement = function () {
		global.isNewElement = true;
		var number  = 100;
		if ($scope.selectedElement != -1) number = $scope.selectedElement;

		$scope.editElement({
			number: getNextNumber(number)
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
			ccg.play(global.settings.playout.channel + "-" + global.settings.playout.videoLayer, data.src, {loop: data.loop, auto: data.auto});
			$scope.clearOnClose = true;
			return;
		}

		if (data.type == "template") {
			ccg.loadTemplate(global.settings.playout.channel + "-" + global.settings.playout.templateLayer, data.src, true, data.data);
			$scope.clearOnClose = true;
			return;
		}
	};

	$scope.queueElement = function (number) {
		var data = getElement(number);

		if (!data) return;

		if (data.type == "media") {
			ccg.loadBg(global.settings.playout.channel + "-" + global.settings.playout.videoLayer, data.src, {loop: data.loop, auto: true});
			$scope.clearOnClose = true;
			return;
		}

		if (data.type == "template") {
			ccg.loadTemplate(global.settings.playout.channel + "-" + global.settings.playout.templateLayer, data.src, false, data.data);
			$scope.clearOnClose = true;
			return;
		}
	};

	$scope.clearMedia = function () {
		ccg.clear(global.settings.playout.channel + "-" + global.settings.playout.videoLayer);
	};

	$scope.stopTemplate = function () {
		ccg.stopTemplate(global.settings.playout.channel + "-" + global.settings.playout.templateLayer);
	};

	$scope.clearTemplate = function () {
		ccg.clear(global.settings.playout.channel + "-" + global.settings.playout.templateLayer);
		ccg.clear(global.settings.playout.channel + "-" + global.settings.playout.templateBgLayer);
	};

	$scope.clear = function () {
		ccg.clear(global.settings.playout.channel);
	};


	$scope.openStatus = function () {
		var newWin = gui.Window.open("status.html",{
			toolbar: false,
			"always-on-top": true,
			width: 550,
			height: 200,
			min_width: 300,
			min_height: 100
		});
	};

	$scope.openSettings = function () {
		var newWin = gui.Window.open("settings.html",{
			position: "center",
			toolbar: false,
			width: 400,
			height: 475,
			resizable: false,
			"always-on-top": true
		});
	};

	$scope.openAbout = function () {
		var newWin = gui.Window.open("https://github.com/respectTheCode/spring/blob/master/README.md", {
			position: "center",
			width: 1024,
			height: 600
		});
	};

	var menu = new gui.Menu({type: "menubar"});
	var fileMenu  = new gui.Menu();
	var editMenu  = new gui.Menu();
	var helpMenu  = new gui.Menu();

	menu.append(new gui.MenuItem({label: "File", submenu: fileMenu}));
	menu.append(new gui.MenuItem({label: "Edit", submenu: editMenu}));
	menu.append(new gui.MenuItem({label: "Help", submenu: helpMenu}));
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
	}));
	fileMenu.append(new gui.MenuItem({
		label: "Save As",
		click: $scope.saveFileAs
	}));

	editMenu.append(new gui.MenuItem({
		label: "New Element",
		click: $scope.newElement
	}));
	editMenu.append(new gui.MenuItem({type: "separator"}));
	editMenu.append(new gui.MenuItem({
		label: "Remove API Element",
		click: $scope.removeTempElements
	}));
	editMenu.append(new gui.MenuItem({type: "separator"}));
	editMenu.append(new gui.MenuItem({
		label: "Settings",
		click: $scope.openSettings
	}));
	editMenu.append(new gui.MenuItem({
		label: "Output Status",
		click: $scope.openStatus
	}));

	helpMenu.append(new gui.MenuItem({
		label: "About",
		click: $scope.openAbout
	}));

	gui.Window.get().menu = menu;

	gui.Window.get().on("close", function () {
		ccg.clear(global.settings.preview.channel + "-1");

		this.close(true);
	});

	$scope.loadNumber = "";
	var numberTimer = false;

	$(window).on("keydown", function (event) {
		if (!$(event.target).is("input,textarea,select")) {
			console.log("is form field");
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

					$scope.selectElement(parseInt($scope.loadNumber, 10));
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
					$scope.queueElement($scope.selectedElement);
					break;
			}
		} else {
			switch (event.keyCode) {
				case 27:
					$(event.target).blur();
					break;
			}
		}

		if (event.ctrlKey || event.metaKey) {
			switch (event.keyCode) {
				// ctrl + s
				case 83:
					$scope.saveFile();
					break;
				// ctrl + o
				case 79:
					$scope.openFile();
					break;
			}
		}

		switch (event.keyCode) {
			// F5 - template play
			case 116:
				ccg.playTemplate(global.settings.playout.channel + "-" + global.settings.playout.templateLayer);
				break;
			// F6 - template stop
			case 117:
				ccg.stopTemplate(global.settings.playout.channel + "-" + global.settings.playout.templateLayer);
				break;
			// F7 - template clear
			case 118:
				ccg.clear(global.settings.playout.channel + "-" + global.settings.playout.templateLayer);
				break;
			// F8 - template next
			case 119:
				ccg.advanceTemplate(global.settings.playout.channel + "-" + global.settings.playout.templateLayer);
				break;
			// F9
			case 120:
				ccg.play(global.settings.playout.channel + "-" + global.settings.playout.videoLayer);
				break;
			// F10
			case 121:
				ccg.stop(global.settings.playout.channel + "-" + global.settings.playout.videoLayer);
				break;
			// F11
			case 122:
				ccg.pause(global.settings.playout.channel + "-" + global.settings.playout.videoLayer);
				break;
			// F12
			case 123:
				ccg.clear(global.settings.playout.channel);
				break;
		}
	});

	if (gui.App.argv.length == 1) {
		var path = gui.App.argv[0];

		if (typeof(path) == "string") {
			$scope.openFile(path);
		}
	} else {
		if (localStorage.openFile) {
			$scope.openFile(localStorage.openFile);
		}
	}

	$scope.openStatus();

	gui.App.on("open", function (e) {
		$scope.openFile(e);
	});

	var win = gui.Window.get();
	win.on("close", function () {
		this.close();
		gui.App.quit();
	});
	global.libraryWindow = win;
};
