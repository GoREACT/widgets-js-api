module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            // define the files to lint
            files: ['src/**/*.js']
        },
        uglify: {
            embedded_str: {
                options: {
                    mangle: false,
                    compress: false,
                    preserveComments: 'some',
                    beautify: true,
                    report: 'gzip'
                },
                files: {
                    'build/embedded-str-syntax.js': [
                        'src/embedded/str-syntax.js'
                    ]
                }
            },
            embedded_str_min: {
                options: {
                    report: 'min',
                    compress: true
                },
                files: {
                    'build/embedded-str-syntax.min.js': [
                        'build/embedded/str-syntax.js'
                    ]
                }
            },
            embedded_dot: {
                options: {
                    mangle: false,
                    compress: false,
                    preserveComments: 'some',
                    beautify: true,
                    report: 'gzip'
                },
                files: {
                    'build/embedded-dot-syntax.js': [
                        'src/embedded/dot-syntax.js'
                    ]
                }
            },
            embedded_dot_min: {
                options: {
                    report: 'min',
                    compress: true
                },
                files: {
                    'build/embedded-dot-syntax.min.js': [
                        'build/embedded/dot-syntax.js'
                    ]
                }
            }
        },
        replace: {
            embedded: {
                options: {
                    patterns: [
                        { match: 'name', replacement: '<%= pkg.name %>' },
                        { match: 'url', replacement: '<%= pkg.config.url %>' },
                    ]
                },
                files: [
                    { expand: true, flatten: true, src: ['build/*.js'], dest: 'build/' }
                ]
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-replace');

    grunt.registerTask('default', ['jshint', 'uglify', 'replace']);
};