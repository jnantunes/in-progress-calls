/* globals window, IPC, _ */
(function() {
	"use strict";
    
    var countries = {};
    
    IPC.Geocoder = function() {
		IPC.Log("Initialising geocoder");

		_.extend(this, IPC.Mediator);
        
        var xhr = new XMLHttpRequest();
        
        // https://github.com/mledoze/countries
        xhr.open("GET", "../data/countries.json", true);
        xhr.send();
        
        xhr.onreadystatechange = this.processCountries;
	};
    
    // http://stackoverflow.com/questions/8227400/algorithm-to-determine-international-calling-code-from-phone-number
    IPC.Geocoder.prototype.getLonLat = function(number) {
        var code;
        var country;
        
        // Largest calling code has 5 digits
        for (var i = 6; i > 1; i--) {
            // Assumes first character is always the plus sign
            code = number.substring(1, i);
            
            if (countries[code]) {
                country = countries[code];
                break;
            }
        }
        
        return ( country ? { lon: country.latlng[1], lat: country.latlng[0] } : null );
    };
    
    IPC.Geocoder.prototype.processCountries = function(xhr) {
        var response = xhr.target;
        
        if ( response.readyState === 4 && response.status === 200 ) {
            var data = JSON.parse(response.responseText);
            
            // creates array with calling codes as keys for geocoding algorithm
            _.each(data, function (country) {
                _.each(country.callingCode, function (code) {
                    countries[code] = country;
                });
            });
        }
    };
}());