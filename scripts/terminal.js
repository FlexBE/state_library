T = new (function() {
	var debug_mode = false;

	this.logInfo = function(msg) {
		console.log(msg);
	}

	this.logWarn = function(msg) {
		console.log("[WARN] " + msg);
	}

	this.logError = function(msg) {
		console.log("[ERROR] " + msg);
	}

	this.debugInfo = function(msg) {
		if (debug_mode) {
			console.log("[DEBUG] " + msg);
		}
	}

	this.debugWarn = function(msg) {
		if (debug_mode) {
			console.log("[WARN] " + msg);
		}
	}

	this.debugError = function(msg) {
		if (debug_mode) {
			console.log("[ERROR] " + msg);
		}
	}

}) ();
