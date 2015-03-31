# Visual Representation of In Progress Calls (IPC)

## Demo

Here's a [demo](http://examples.jnantunes.com/calls/examples/) of the application, which generates new calls every 5 seconds.

![Screenshot](/examples/inprogresscalls.png?raw=true)

## Features

### 0.1.0

* Check calls status through the curve color. Currently unanswered calls are represented by a grey curve, and ongoing calls by green one.
* Control the point of view using the left mouse button to rotate, and the mouse wheel to zoom in and out.

### Possible future features

* Improved location for calls origin and destination, resulting in a richer visualization.
* Enable selection of countries, displaying only calls from and to it.
* Enable the visualization of the number of calls between two locations. At the moment if two or more calls are ongoing between the same two locations, only one curve is visible.
* Develop some dashboard widgets.

## Getting started

### Main components

#### WebGL

This application is based on WebGL, using the [Three.js](http://threejs.org/) library to create and manage the scene objects. The scene is composed by four main objects, three spheres (starts, Earth and Earth's clouds) and an object aggregating all drawn curves.

#### Geocoder

Using a previously acquired [list](// https://github.com/mledoze/countries) of countries' data, all calls are geocoded using the dial codes from the phone numbers. With this [process](// http://stackoverflow.com/questions/8227400/algorithm-to-determine-international-calling-code-from-phone-number) a latitude/longitude is obtained for the call's origin and destination, enabling its visualization on the globe.

#### Mediator

The interactions between all the various components are coordinated using a [mediator](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#mediatorpatternjavascript), facilitating the decouple of the various objects. With this, the components can be changed almost completely without impact on others. For example, another tool could replace WebGL, while keeping the call generation class and the geocoding process working as is.

#### Scene

This class handles most of the application logic, subscribing and publishing to all the required topics, orchestrating the complete animation.

### Building project

#### Install Node.js and NPM

You can use [Homebrew](http://brew.sh/) to do that, by typing the following line, once installed:

```
brew install node
```

#### Install Grunt CLI

The project uses [Grunt](http://gruntjs.com/) Command Line Interface (CLI) to automated repetitive tasks. Install it by typing:

```
npm install -g grunt-cli
```

#### Install the NPM packages

To install the project required packages, navigate to the project directory and type:

```
npm install
```

### Developing

The following tasks are available for use:

* Serve the project files locally using Grunt
```
grunt serve
```
* Builds the project, watching for changes
```
grunt dev
```
* Minifies and uglifies code
```
grunt min
```
* Runs a javascript code quality tool over the project code
```
grunt test
```

## Libraries and resources used

* [Underscore](http://underscorejs.org/) - Programming helpers
* [Moment](http://momentjs.com/) - Date/time library
* [Three](http://threejs.org/) - WebGL library
