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
	devel: true,
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
  grunt.registerTask('default', 'describe lint qunit concat min');

  // Other task chains
  grunt.registerTask('make-viewer', 'describe lint qunit concat min make-viewer-html');

  // Build a html visualization file and pipe to stdout
  grunt.registerTask('make-viewer-html',
    'Create a html file to visualize point data from a geojson file',
    function(filepath) {
      if (arguments.length === 0) {
        filepath = 'fixtures/autzen.json';
      }

      var newfilepath = 'tmp/' + filepath;
      grunt.file.copy(filepath, newfilepath);
      grunt.log.write('Copied ' + filepath + ' to ' + newfilepath + '\n');

      grunt.file.recurse('dist', function( abspath, rootdir, subdir, filename ) {
        grunt.file.copy(abspath, 'tmp/js/' + filename);
        grunt.log.write('Copied ' + abspath + ' to ' + 'tmp/js/' + filename + '\n');
      });

      grunt.file.recurse('vendor', function( abspath, rootdir, subdir, filename ) {
        if (grunt.file.isMatch('*.js', filename)) {
          grunt.file.copy(abspath, 'tmp/js/' + filename);
          grunt.log.write('Copied ' + abspath + ' to ' + 'tmp/js/' + filename + '\n');
        } else if (grunt.file.isMatch('*.css', filename)) {
          grunt.file.copy(abspath, 'tmp/css/' + filename);
          grunt.log.write('Copied ' + abspath + ' to ' + 'tmp/css/' + filename + '\n');
        } else if (grunt.file.isMatch('*.png', filename)) {
          grunt.file.copy(abspath, 'tmp/css/images/' + filename);
          grunt.log.write('Copied ' + abspath + ' to ' + 'tmp/css/images/' + filename + '\n');
        }

      });

      var data = {
        'url': filepath
      };

      var template = grunt.file.read('templates/viewer.html');
      grunt.log.write(template);
      grunt.log.write(filepath);
      var html = grunt.template.process(template, data);
      grunt.log.write(html);
      grunt.file.write('tmp/viewer.html', html);
      grunt.log.write('Generated tmp/viewer.html\n');
    }
  );

  // http://stackoverflow.com/questions/13130710/can-you-record-the-git-revision-with-gruntjs
  grunt.registerTask("describe", "Describes current git commit", function (prop) {
    var done = this.async();

    grunt.log.write("Describe current commit: ");

    grunt.utils.spawn({
      cmd : "git",
      args : [ "describe", "--tags", "--always", "--long", "--dirty" ]
    }, function (err, result) {
      if (err) {
        grunt.log.error(err);
        return done(false);
      }

      grunt.config(prop || "meta.version", result);

      grunt.log.writeln(result.green);

      done(result);
    });
  });
};
