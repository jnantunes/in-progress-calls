/* globals window, IPC, _, THREE */
(function() {
	"use strict";
    
    // stores active calls
    var active = {};
    
    var constrain = function(value, min, max){
        if( value < min ) {
            value = min;
        } else {
            if( value > max ) {
                value = max;
            }
        }
        
        return value;
    };
    
    IPC.WebGL = function() {
		IPC.Log("Initialising WebGL");

		_.extend(this, IPC.Mediator);
        
        this.renderer = undefined;
        this.camera = undefined;
        this.scene = undefined;
        this.curves = undefined;
	};
        
    IPC.WebGL.prototype.init = function() {
        
        this.initDOMContainer();
        
        this.initWebGL();
        
        this.initObjects();
        
        this.initDOMEvents();
    };
            
    IPC.WebGL.prototype.initDOMContainer = function() {
        var container = document.createElement("div");
        container.id = "app-container";
        container.class = "AppContainer";
        
        document.body.appendChild(container);
    };
    
    IPC.WebGL.prototype.initDOMEvents = function() {
        var that = this;
        
        window.addEventListener( "resize", function(event) {
			that.publish("resize", event);
		}, false );
        
        this.subscribe("resize", function() {
            that.renderer.setSize( window.innerWidth, window.innerHeight );
            
            that.camera.aspect = window.innerWidth / window.innerHeight;
            that.camera.updateProjectionMatrix();
        });
    };
    
    IPC.WebGL.prototype.initWebGL = function() {
        var webglEl = document.getElementById('app-container');
        
        var width  = window.innerWidth;
        var height = window.innerHeight;
        
        var scene = new THREE.Scene();

        var camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
        camera.position.z = 2;
    
        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
    
        scene.add(new THREE.AmbientLight(0x333333));
    
        var light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(30,3,5);
        scene.add(light);
        
        var controls = new THREE.TrackballControls(camera);
        
        controls.noPan = true;
        
        webglEl.appendChild(renderer.domElement);
        
        var render = function() {
            controls.update();
            window.requestAnimationFrame(render);
            renderer.render(scene, camera);
        };
        
        render();
        
        this.renderer = renderer;
        this.camera = camera;
        this.scene = scene;
    };
    
    IPC.WebGL.prototype.initObjects = function() {
        var scene = this.scene;
        
        var radius   = 0.5;
        var segments = 32;
        var rotation = 6;
        var rotationSpeed = 0.001;
    
        var sphere = this.createSphere(radius, segments);
        sphere.rotation.x = Math.PI;				
        sphere.rotation.y = -Math.PI/2;
        sphere.rotation.z = Math.PI;
        scene.add(sphere);
    
        var clouds = this.createClouds(radius, segments);
        clouds.rotation.y = rotation;
        scene.add(clouds);
    
        var stars = this.createStars(90, 64);
        scene.add(stars);
        
        var curves = new THREE.Object3D();
        scene.add(curves);
        
        var render = function() {
            sphere.rotation.y += rotationSpeed;
            clouds.rotation.y -= rotationSpeed;
            curves.rotateOnAxis(new THREE.Vector3( 0, 1, 0 ), -rotationSpeed);
            window.requestAnimationFrame(render);
        };
        
        render();
        
        this.curves = curves;
    };
    
    IPC.WebGL.prototype.createSphere = function(radius, segments) {
        return new THREE.Mesh(
            new THREE.SphereGeometry(radius, segments, segments),
            new THREE.MeshPhongMaterial({
                map:         THREE.ImageUtils.loadTexture('../images/2_no_clouds_4k.jpg'),
                bumpMap:     THREE.ImageUtils.loadTexture('../images/elev_bump_4k.jpg'),
                bumpScale:   0.005,
                specularMap: THREE.ImageUtils.loadTexture('../images/water_4k.png'),
                specular:    new THREE.Color('grey')								
            })
        );
    };
    
    IPC.WebGL.prototype.createClouds = function(radius, segments) {
        return new THREE.Mesh(
            new THREE.SphereGeometry(radius + 0.003, segments, segments),			
            new THREE.MeshPhongMaterial({
                map:         THREE.ImageUtils.loadTexture('../images/fair_clouds_4k.png'),
                transparent: true
            })
        );		
    };
    
    IPC.WebGL.prototype.createStars = function(radius, segments) {
        return new THREE.Mesh(
            new THREE.SphereGeometry(radius, segments, segments), 
            new THREE.MeshBasicMaterial({
                map:  THREE.ImageUtils.loadTexture('../images/galaxy_starfield.png'), 
                side: THREE.BackSide
            })
        );
    };
    
    IPC.WebGL.prototype.updateCurve = function(id, color) {
        var curve = active[id];
        
        curve && color && curve.material.color.setHex(color);
    };
    
    IPC.WebGL.prototype.addCurve = function(id, from, to) {
        var geometry = this.createPathGeometry(from, to);
        
        var curve = new THREE.Line(
            geometry, 
            new THREE.LineBasicMaterial(
                {
                    color: 0xC0C0C0,
                    linewidth: 2
                }
            ) 
        );
        
        this.curves.add(curve);
        
        active[id] = curve;
    };
    
    IPC.WebGL.prototype.removeCurve = function(id) {
        var curve = active[id];
        
        if (curve) {
            this.curves.remove(curve);
            delete active[id];
        }
    };
    
    // http://workshop.chromeexperiments.com/projects/armsglobe/
    IPC.WebGL.prototype.createPathGeometry = function(from, to) {
        var globeRadius = 0.5;
        var vec3_origin = new THREE.Vector3(0,0,0);
        
        var start = this.getCenterFromLonLat(from);
        var end = this.getCenterFromLonLat(to);
        
        var distanceBetweenCountryCenter = (new THREE.Vector3()).subVectors(start, end).length();
        
        var mid = start.clone().lerp(end,0.5);	
        var midLength = mid.length();
        mid.normalize();
        mid.multiplyScalar( midLength + distanceBetweenCountryCenter * 0.4 );
    
        var normal = (new THREE.Vector3()).subVectors(start,end);
        normal.normalize();
    
        var distanceHalf = distanceBetweenCountryCenter * 0.5;
    
        var startAnchor = start;
        var midStartAnchor = mid.clone().add( normal.clone().multiplyScalar( distanceHalf ) );					
        var midEndAnchor = mid.clone().add( normal.clone().multiplyScalar( -distanceHalf ) );
        var endAnchor = end;
    
        var splineCurveA = new THREE.CubicBezierCurve3( start, startAnchor, midStartAnchor, mid);
        var splineCurveB = new THREE.CubicBezierCurve3( mid, midEndAnchor, endAnchor, end);
        
        var vertexCountDesired = Math.floor( distanceBetweenCountryCenter * 0.02 + 12 ) * 2;	
    
        var points = splineCurveA.getPoints( vertexCountDesired );
    
        points = points.splice( 0,points.length-1 );
        points = points.concat( splineCurveB.getPoints( vertexCountDesired ) );
    
        points.push( vec3_origin );
        
        var curveGeometry = new THREE.Geometry();
        for( var i = 0; i < points.length; i ++ ) {
            curveGeometry.vertices.push( points[i] );
        }
        
        return curveGeometry;
    };
    
    IPC.WebGL.prototype.getCenterFromLonLat = function(lonlat) {
        var sphereRad = 1;				
        var rad = 0.5;
        
        var lon = lonlat.lon - 90;
        var lat = lonlat.lat;
        
        var phi = Math.PI/2 - lat * Math.PI / 180;
        var theta = 2 * Math.PI - lon * Math.PI / 180;
        
        var center = new THREE.Vector3();                
        center.x = Math.sin(phi) * Math.cos(theta) * rad;
        center.y = Math.cos(phi) * rad;
        center.z = Math.sin(phi) * Math.sin(theta) * rad;
        
        return center;
    };
    
}());