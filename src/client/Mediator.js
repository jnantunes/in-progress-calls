/* globals window, IPC */
(function() {
	"use strict";

    // http://addyosmani.com/resources/essentialjsdesignpatterns/book/#mediatorpatternjavascript
	IPC.Mediator = (function() {
		var topics = {};

		var subscribe = function( topic, fn ){

			if ( !topics[topic] ){ 
				topics[topic] = [];
			}

			topics[topic].push( { context: this, callback: fn } );

			return this;
		};

		var publish = function( topic ){

			var args;

			if ( !topics[topic] ){
				return false;
			} 

			args = Array.prototype.slice.call( arguments, 1 );
			for ( var i = 0, l = topics[topic].length; i < l; i++ ) {

				var subscription = topics[topic][i];
				subscription.callback.apply( subscription.context, args );
			}
            
			return this;
		};

		return {
			publish: publish,
			subscribe: subscribe
		};
        
	}());
}());