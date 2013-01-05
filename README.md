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

## Understanding the Preview Channel

	This channel will preview the selected element. It is intended to help the operator confirm the element they have selected.

## Keyboard Shortcuts

* Selecting element by nubmer
	* use the numeric keypad to type the number
	* keypad `.` to clear the numbers that have been typed
	* keypad `enter` to select the element

* Controlling the selected element
	* keypad "+" plays the element on the playout channel
	* keypad "-" loads the element in the background of the playout channel

* Switching playout channels
	This is a planned feature and does not work yet. For now channel 1 is the only channel.
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