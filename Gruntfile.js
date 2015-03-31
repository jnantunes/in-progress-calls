module.exports = function(grunt) {
	var port = grunt.option('port') || 8000;

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! InProgressCalls <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				beautify : {
					ascii_only : true
				}
			},
			build: {
				src: 'build/ipc.js',
				dest: 'build/ipc.min.js'
			}
		},
		concat: {
			options: {},
			dist: {
				src: [
					'src/resources/underscore.js',
					'src/resources/moment.js',
                    'src/resources/three.js',
                    'src/resources/TrackballControls.js',
                    'src/client/IPC.js',
					'src/client/Mediator.js',
                    'src/client/Log.js',
                    'src/client/Scene.js',
                    'src/client/WebGL.js',
                    'src/client/Geocoder.js',
                    'src/client/Generator.js'
				],
				dest: 'build/ipc.js'
			}
		},
		jshint: {
			options: {
				force: true,
				curly: false,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				eqnull: true,
				browser: true,
				expr: true,
				globals: {
					head: false,
					module: false,
					console: false,
					importScripts: true
				},
				ignores: ['src/resources/**']
			},
			files: [ 'Gruntfile.js', 'src/**' ]
		},
		watch: {
			main: {
				files: [ 'Gruntfile.js', 'src/**' ],
				tasks: 'default',
				options: {
					livereload: true
				}
			}
		},
		connect: {
			server: {
				options: {
					port: port,
                    hostname: 'localhost',
					base: '.',
					keepalive: true,
					debug: true
				}
			}
		},
		notify: {
			watch: {
				options: {
					message: 'Watching for changes'
				}
			},
			finish: {
				options: {
					message: 'Build complete'
				}
			}
		},
		notify_hooks: {
			options: {
				enabled: true,
				max_jshint_notifications: 5,
				title: "InProgressCalls"
			}
		}
	});

	// Load the plugins
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-notify');

	// Default tasks
	grunt.registerTask('default', ['jshint', 'concat', 'notify:finish']);

	// Serve examples locally
	grunt.registerTask('serve', ['connect']);

	// Build files and refresh content on file changes
	grunt.registerTask('dev', ['default', 'notify:watch', 'watch']);

	// Minify
	grunt.registerTask('min', ['jshint', 'concat', 'uglify', 'notify:finish']);

	// Run tests
	grunt.registerTask('test', ['jshint']);
	
	grunt.task.run('notify_hooks');
};
