var gui = require("nw.gui");
var _ = require("underscore");

var elementsCtrl = function ($scope) {
	$scope.elements = {};
	$scope.channel = "1-1";

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
	var scriptMenu  = new gui.Menu();
	menu.append(new gui.MenuItem({label: "File", submenu: fileMenu}));
	menu.append(new gui.MenuItem({label: "Script", submenu: scriptMenu}));
	fileMenu.append(new gui.MenuItem({label: "New"}));
	fileMenu.append(new gui.MenuItem({label: "Open"}));
	fileMenu.append(new gui.MenuItem({label: "Save", enabled: false}));
	fileMenu.append(new gui.MenuItem({label: "Save As", checked: true}));
	scriptMenu.append(new gui.MenuItem({label: "New Script", click: function () {
		alert("new");
	}}));
	scriptMenu.append(new gui.MenuItem({label: "Open Script"}));

	gui.Window.get().menu = menu;
};