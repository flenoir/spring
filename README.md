Spring
======

Controller for Caspar CG built with node-caspar-cg and node-webkit

## Setup

1. Install node
2. Global install jake `npm inatall -g jake`
3. Install dependencies `npm install -d`
4. Download node-webkit
  * Windows 
    * place the .exe, .dll and .pak files in the spring folder
  * OS X
    * place node-webkit in /Applications

## Build and Run

Run `jake`

## Package (Windows only)

Run `jake build:package`

This will make spring.exe in the root of the project. You can move spring.exe, but you must also copy the `.dll` and `.pak` files. The settings are stored in `settings.json` in the smae folder as `spring.exe`.

## Understanding the Preview Channel
This channel will preview the selected element. It is intended to help the operator confirm the element they have selected.

## Keyboard Shortcuts

* Selecting element by nubmer
	* use the numeric keypad to type the number
	* keypad `.` to clear the numbers that have been typed
	* keypad `enter` to select the element

* Controlling the selected element
	* keypad `+` plays the element on the playout channel
	* keypad `-` loads the element in the background of the playout channel

* Switching playout channels (This is a planned feature and does not work yet. For now channel 1 is the only channel.)

	* `F1` select playout channel 1
	* `F2` select playout channel 2
	* `F3` select playout channel 3
	* `F4` select playout channel 4

* Controlling the playout channel
	* `F5` Play template
	* `F6` Stop template
	* `F7` Clear template
	* `F8` Template next
	* `F9` Play media
	* `F10` Stop media
	* `F11` Pause media
	* `F12` Clear channel

## API to add and modify elements

This is a simple http api that allows you to add elements to a script dynamically that will not be saved as part of the script. This can be used for things like competitor lower thirds. A seporate stats system calls the API to add all competitors to the script. It then calls the API again when competitor stats change. If an element number already exists and the existing element was created by the API it is replaced. Elements that are created by hand will not be overwritten by the API.

Send an HTTP `GET` or `POST` to `http://127.0.0.1:3000`. Pass one parameter `elements` with a JSON encoded array of elements in.

Example JSON

	[
		{
			"name": "Competior 1 Score - 9.99",
			"number": 1001,
			"type": "template",
			"src": "competior_lower_third",
			"data": {
				"f0": "Competior 1",
				"f1": "9.99"
			}
		}, {
			"name": "Competior 2 Score - 9.5",
			"number": 1002,
			"type": "template",
			"src": "competior_lower_third",
			"data": {
				"f0": "Competior 2",
				"f1": "9.5"
			}
		}
	]

Example GET

	http://127.0.0.1:3000/api?elements=[{"name":"Competior 1 Score - 9.99","number":1001,"type":"template","src":"competior_lower_third","data":{"f0":"Competior 1","f1":"9.99"}},{"name":"Competior 2 Score - 9.5","number":1002,"type":"template","src":"competior_lower_third","data":{"f0":"Competior 2","f1":"9.5"}}]