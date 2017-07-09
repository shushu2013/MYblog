module.exports = function(grunt) {
	// 加载插件
	[
		'grunt-cafe-mocha',
		'grunt-contrib-jshint',
		'grunt-exec',
	].forEach(function(task) {
		grunt.loadNpmTasks(task);
	});

	var port = 3000;

	// 配置插件
	grunt.initConfig({
		cafemocha: {
			all: {
				src: 'public/test/utest/tests-*.js', 
				options: {ui: 'tdd', require: ['chai']},
			}
		},
		jshint: {
			app: ['app.js', 'cluster.js', 'routes/*.js', 
				'models/*.js', 'lib/*.js'],
			tests: ['Gruntfile.js', 'public/test/*.js', 'public/test/**/*.js'],
		},
		exec: {
			linkchecker: {
				cmd: 'linkchecker http://localhost:' + port,
			}
		},
	});

	// 注册任务
	grunt.registerTask('default', ['cafemocha', 'jshint', 'exec']);
};