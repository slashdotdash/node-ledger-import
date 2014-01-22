module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Task configuration.
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
        unused: true,
        boss: true,
        eqnull: true,
        indent: 2,
        globals: {
          module: true,
          exports: true,
          require: true,
          process: true,
          console: true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: ['lib/**/*.js']
      },
      spec: {
        src: ['spec/**/*.js'],
        options: {
          globals: {
            module: true,
            exports: true,
            require: true,
            console: true,
            describe: true,
            xdescribe: true,
            it: true,
            xit: true,
            expect: true,
            beforeEach: true
          }
        }
      }
    },
    
    'jasmine-node': {
      run: {
        spec: 'spec'
      },
      executable: './node_modules/.bin/jasmine-node'
    },

    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib: {
        files: '<%= jshint.lib.src %>',
        tasks: ['jshint:lib']
      },
      spec: {
        files: '<%= jshint.spec.src %>',
        tasks: ['jshint:spec', 'jasmine-node']
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jasmine-node');
  
  // Default task.
  grunt.registerTask('default', ['jshint', 'jasmine-node']);
  
  grunt.registerTask('spec', ['jasmine-node']);
};