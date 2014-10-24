module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            // define the files to lint
            files: ['src/**/*.js']
        },
        uglify: {
            build_embedded: {
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
                    ],
                    'build/embedded-dot-syntax.js': [
                        'src/embedded/dot-syntax.js'
                    ]
                }
            },
            build_embedded_min: {
                options: {
                    report: 'min',
                    compress: true
                },
                files: {
                    'build/embedded-str-syntax.min.js': [
                        'build/embedded/str-syntax.js'
                    ],
                    'build/embedded-dot-syntax.min.js': [
                        'build/embedded/dot-syntax.js'
                    ]
                }
            },
            prep_api: {
                options: {
                    mangle: false,
                    compress: false,
                    preserveComments: 'some',
                    beautify: true,
                    exportAll: true,
                    report: 'gzip'
                },
                files: {
                    '.tmp/api.js': [
                        'src/widgets/api/*.js',
                    ]
                }
            },
            prep_widgets: {
                options: {
                    mangle: false,
                    compress: false,
                    preserveComments: 'some',
                    exportAll: true,
                    beautify: true,
                    report: 'gzip'
                },
                files: {
                    '.tmp/widgets.js': [
                        'src/widgets/package.js',
                        'src/widgets/dispatcher.js',
                        'src/widgets/interlace.js',
                        'src/widgets/bootstrap.js'
                    ]
                }
            },
            build_widgets: {
                options: {
                    mangle: false,
                    compress: false,
                    preserveComments: 'some',
                    exportAll: true,
                    beautify: true,
                    banner: '(function(){\n',
                    footer: '\n})();'
                },
                files: {
                    'build/widgets.js': [
                        '.tmp/widgets.js',
                        '.tmp/api.js',
                        'bower_components/pym.js/src/pym.js'
                    ]
                }
            },
            prettify_build_widgets: {
                options: {
                    mangle: false,
                    compress: false,
                    preserveComments: 'some',
                    exportAll: true,
                    beautify: true
                },
                files: {
                    'build/widgets.js': [ // prettify
                        'build/widgets.js'
                    ]
                }
            },
            build_widgets_min: {
                options: {
                    report: 'min',
                    compress: true
                },
                files: {
                    'build/widgets.min.js': [
                        'build/widgets.js'
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
        },
        clean: [".tmp"]
    });


    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-clean');

//    grunt.registerTask('default', ['jshint', 'uglify', 'replace']);
    grunt.registerTask('default', ['uglify', 'replace', 'clean']);
//    grunt.registerTask('default', ['uglify', 'replace']);
};