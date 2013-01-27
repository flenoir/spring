var events = require("events");
var util = require("util");
var express = require("express");
var _ = require("underscore");

var apiServer = function () {
	events.EventEmitter.call(this);
	var self = this;

	self.isRunning = false;
}
util.inherits(apiServer, events.EventEmitter);

apiServer.prototype.start = function () {
	var self = this;

	if (self.isRunning) return;

	var app = self.app = express();
	app.listen(3000);

	app.get("/api", function (req, res) {
		var data = req.body || req.query;

		if (!data.elements) {
			res.send({success: false, error: "Elements must be sent as JSON in either as a GET query string or a POST body."})
			return;
		}

		var elements = data.elements;

		if (typeof(elements) == "string") {
			try {
				elements = JSON.parse(elements);
			} catch (err) {
				res.send({success: false, error: "Invalid JSON string"});
				return;
			}
		}

		if (!_.isArray(elements)) elements = [elements];

		var requiredKeys = ["number", "type", "src"];
		var possibleKeys = ["number", "name", "type", "src", "data"];
		var invalid = false;
		var error = [];

		_.each(elements, function (element) {
			if (invalid) return;

			_.each(requiredKeys, function (key) {
				if (!element[key]) {
					invalid = true;
					error.push("Missing key " + key);
				}
			});

			_.each(element, function (value, key) {
				if (!_.contains(possibleKeys, key)) {
					invalid = true;
					error.push("Invalid key " + key);
				}
			});
		});

		if (invalid) {
			res.send({success: false, error: error})
			return;
		}

		self.emit("newElements", elements);

		res.send({success: true});
	});
};

module.exports = apiServer;