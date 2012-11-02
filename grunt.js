/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    meta: {
      version: '0.1.0',
      banner: '/*! allover.js - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* http://github.com/CRREL/allover.js\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
        'Pete Gadomski; Licensed MIT */'
    },
    lint: {
      files: ['grunt.js', 'lib/**/*.js', 'test/**/*.js']
    },
    qunit: {
      files: ['test/**/*.html']
    },
    concat: {
      dist: {
        src: ['<banner:meta.banner>', '<file_strip_banner:lib/qt-controls.js>',
          '<file_strip_banner:lib/boundingbox.js>',
          '<file_strip_banner:lib/viewer.js>'],
        dest: 'dist/allover.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/allover.min.js'
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit concat',
      viewer: {
        files: ['<config:lint.files>', 'templates/viewer.html'],
        tasks: 'lint qunit concat make-viewer'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        jquery: true
      },
      globals: {
        colorbrewer: true,
        THREE: true,
        d3: true,
        Stats: true
      }
    },
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'lint qunit concat min');

  // Build a html visualization file and pipe to stdout
  grunt.registerTask('make-viewer',
    'Create a html file to visualize point data from a geojson file',
    function(filepath) {
      if (arguments.length === 0) {
        filepath = 'fixtures/autzen.json';
      }
      var data = {
        'GeoJSON': grunt.file.read(filepath)
      };
      var template = grunt.file.read('templates/viewer.html');
      var html = grunt.template.process(template, data);
      grunt.file.mkdir('tmp');
      grunt.file.write('tmp/viewer.html', html);
      grunt.log.write("Generated tmp/viewer.html\n");
    });
};
