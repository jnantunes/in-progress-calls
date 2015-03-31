/* globals window, IPC, _ */
(function() {
	"use strict";

	IPC.Scene = function() {
        IPC.Log("Initialising scene");

		_.extend(this, IPC.Mediator);
        
        this.webgl = undefined;
        this.geocoder = undefined;
        this.generator = undefined;
	};

	IPC.Scene.prototype.init = function(options) {
		IPC.Log("Loading scene");
        
		if (!options) {
			options = {};
		}

		this.options = options;

		_.defaults(options, {
			rate: 30
		});
        
		this.initUI();
        this.initFilters();
        this.initStream(options.rate);
	};
    
    IPC.Scene.prototype.initUI = function() {
        IPC.Log("Initialising interface");
        
        var webgl = new IPC.WebGL();
        webgl.init();
        
        this.subscribe("call_located", function (call, origin, destination) {
            IPC.Log("Call will be added to globe");
            
            var id = call.call_id;
            webgl.addCurve(id, origin, destination);
        });
        
        this.subscribe("call_answered", function (call) {
            var id = call.call_id;
            webgl.updateCurve(id, 0x448c44);
        });
        
        this.subscribe("call_finished", function (call) {
            var id = call.call_id;
            webgl.removeCurve(id);
        });
        
        this.webgl = webgl;
    };
    
    // All initiated calls are geocoded, to enable visualization
    IPC.Scene.prototype.initFilters = function() {
        IPC.Log("Initialising event filters");
        
        var geocoder = new IPC.Geocoder();
        
        this.subscribe("call_initiated", function(call) {
            var origin = geocoder.getLonLat(call.source_phone_number);
            var destination = geocoder.getLonLat(call.destination_phone_number);
            
            if (origin && destination) {
                IPC.Log("Call was geocoded successfully");
                
                this.publish("call_located", call, origin, destination);
            }
        });
        
        this.geocoder = geocoder;
    };
    
    // Calls lifetime simulation
    IPC.Scene.prototype.initStream = function(rate) {
        IPC.Log("Initialising event stream");
        
        var generator = new IPC.Generator();
        
        var that = this;
        var interval = 60000 / rate;
        
        setInterval(function() {
            var call = that.generator.generateCall();
            var startTime = _.random( 5,10 ) * 1000;
            
            call && setTimeout(function() {
                that.publish("call_initiated", call);
            }, startTime);
        }, interval);
        
        this.subscribe("call_initiated", function(call) {
            var answerTime = _.random( 5,10 ) * 1000;
            
            setTimeout(function() {
                call.event = "call_answered";
                that.publish("call_answered", call);
            }, answerTime);
        });
        
        this.subscribe("call_answered", function(call) {
            var callTime = _.random( 10,30 ) * 1000;
            
            setTimeout(function() {
                call.event = "call_finished";
                that.publish("call_finished", call);
            }, callTime);
        });
        
        this.generator = generator;
    };

}());