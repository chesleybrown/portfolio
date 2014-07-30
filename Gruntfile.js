'use strict';

module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		express: {
			options: {
				port: 8000
			},
			server: {
				options: {
					script: 'app.js'
				}
			}
		},
		env: {
			setup: {
				src: '.env'
			}
		},
		watch: {
			node: {
				files: ['app.js', 'settings.js'],
				tasks: ['express:server'],
				options: {
					spawn: false
				}
			}
		}
	});
	
	grunt.registerTask('server', ['env:setup', 'express:server', 'watch:node']);
	grunt.registerTask('default', ['server']);
};