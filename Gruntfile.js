'use strict';

module.exports = function (grunt) {
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
		tabs4life: {
			web: {
				options: {
					jshint: {
						browser: true,
						globals: {
							angular: true
						}
					}
				},
				src: [
					'web/js/**/*.js',
					'web/**/*.html',
					'web/**/*.txt',
					'web/css/**/*.css',
					'!web/components/**/*'
				]
			},
			app: {
				options: {
					jshint: {
						node: true
					}
				},
				src: [
					'.gitignore',
					'.env.dist',
					'*.js',
					'*.json',
					'Procfile'
				]
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
	grunt.registerTask('test', []);
	grunt.registerTask('default', ['server']);
};
