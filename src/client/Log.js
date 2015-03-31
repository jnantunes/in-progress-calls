/* globals window, IPC, moment */
(function() {
	"use strict";
    
    // http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
	IPC.Log = function() {
		if (!IPC.DEBUG) {
			return;
		}
		
		var args = Array.prototype.slice.call(arguments);

		var timestamp = "[" + moment().format("HH:mm:ss.SSS") + "]";
		args.unshift(timestamp);

		if (console) {
			console.log.apply(console, args);
		}
	};
}());