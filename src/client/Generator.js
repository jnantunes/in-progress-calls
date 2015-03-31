/* globals window, IPC, _ */
(function() {
	"use strict";
    
    var uid = 0;
    var codes = [];

    IPC.Generator = function() {
		IPC.Log("Initialising generator");

		_.extend(this, IPC.Mediator);
        
        var xhr = new XMLHttpRequest();
        
        // https://gist.github.com/Goles/3196253
        xhr.open("GET", "../data/CountryCodes.json", true);
        xhr.send();
        
        xhr.onreadystatechange = this.processCountries;
	};
    
    // Creates dummy call events, only for geographic visualization according to country codes
    IPC.Generator.prototype.generateCall = function() {
        var call = null;
        
        var source = this.generatePhoneNumber();
        var destination = this.generatePhoneNumber();
        
        if (source && destination) {
            uid += 1;
            
            call = {  
                "event": "call_initiated",  
                "type": "in",  
                "duration": "91",  
                "account_id": "4f4a37a201c642014200000c",  
                "contact_id": "505de7e5f857d94a3d000001",  
                "call_id": uid,  
                "destination_phone_number": destination,  
                "source_phone_number": source,  
                "forwarded_phone_number": null,  
                "agent_id": "4f78ded32b0ac00001000001",  
                "previous_agent_id": "5054d89ec7573f082a000c9e",  
                "customer_id": "505de7e5f857d94a3d000001",  
                "customer": null,  
                "timestamp": "2012-09-28T16:09:07Z"
            };
        }
        
        return call;
    };
    
    IPC.Generator.prototype.generatePhoneNumber = function() {
        var generated = null;
        
        var country = _.random(0, codes.length - 1);
        
        if (codes[country]) {
            var number = Math.floor(Math.random() * 1000000000);
        
            generated = codes[country].concat(number);
        }
        
        return generated;
    };
    
    IPC.Generator.prototype.processCountries = function(xhr) {
        var response = xhr.target;
        
        if ( response.readyState === 4 && response.status === 200 ) {
            var data = JSON.parse(response.responseText);
            
            // creates array with all available calling codes, without whitespaces
            codes = _.map(data, function(country) {
                return ( country.dial_code ? country.dial_code.replace(/\s+/g, '') : null );
            });
        }
    };
    
}());