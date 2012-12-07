var gui = require("nw.gui");
var _ = require("underscore");

var elementsCtrl = function ($scope) {
	$scope.elements = {};
	$scope.channel = "2-1";
	$scope.previewChannel = "1-1";

	$scope.$watch("previewChannel", function () {
		global.previewChannel = $scope.previewChannel;
	});

	var elementContextMenu = new gui.Menu();
	elementContextMenu.append(new gui.MenuItem({label: "Edit Element", click: function () {
		$scope.editElement($scope.elementContextMenuId);
		$scope.elementContextMenuId = false;
	}}));

	$scope.elementContextMenu = function (event, id) {
		$scope.elementContextMenuId = id;
		elementContextMenu.popup(event.clientX, event.clientY);
	};

	global.editElementCallback = function (id, data) {
		global.editElement = false;
		global.editElementId = false;
		$scope.elements[id] = data;
		$scope.$apply();
	}

	$scope.editElement = function (id) {
		global.editElement = $scope.elements[id];
		global.editElementId = id;
		$scope.newElement();
	}

	$scope.newElement = function () {
		var newWin = gui.Window.get(window.open("elementEditor.html"));
		newWin.setMinimumSize(600, 340);
		newWin.resizeTo(650, 600);
		newWin.setPosition("center");
	};


	var menu = new gui.Menu({type: "menubar"});
	var fileMenu  = new gui.Menu();
	var editMenu  = new gui.Menu();
	menu.append(new gui.MenuItem({label: "File", submenu: fileMenu}));
	menu.append(new gui.MenuItem({label: "Edit", submenu: editMenu}));
	fileMenu.append(new gui.MenuItem({label: "New"}));
	fileMenu.append(new gui.MenuItem({label: "Open"}));
	fileMenu.append(new gui.MenuItem({label: "Save", enabled: false}));
	fileMenu.append(new gui.MenuItem({label: "Save As", checked: true}));
	editMenu.append(new gui.MenuItem({
		label: "New Element",
		click: $scope.newElement
	}));
	editMenu.append(new gui.MenuItem({type: "separator"}));
	editMenu.append(new gui.MenuItem({label: "Settings"}));

	gui.Window.get().menu = menu;
};