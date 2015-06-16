module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: grunt.file.readJSON('settings.json'),
        jshint: {
            // define the files to lint`
            files: ['src/**/*.js']
        },
        uglify: {
            // :: widgets.js ::
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
                        'src/widgets/service.js',
                        'src/widgets/config.js',
                        'src/widgets/utils.js',
                        'src/widgets/dispatcher.js',
                        'src/widgets/factory.js',
                        'src/widgets/auth.js',
                        'src/widgets/api.js',
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
                    banner: '(function(global, undefined){\n',
                    footer: '\n})(this);'
                },
                files: {
                    'build/widgets.js': [
                        '.tmp/settings.js',
                        '.tmp/widgets.js'
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
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    '.tmp/loading.css': ['src/styles/loading.css']
                }
            }
        },
        replace: {
            embedded: {
                options: {
                    patterns: [
                        { match: 'name', replacement: '<%= pkg.name %>' },
                        { match: 'loadingStyle', replacement: function() {
                            return grunt.file.read('.tmp/loading.css');
                        } }
                    ]
                },
                files: [
                    { expand: true, flatten: true, src: ['build/*.js'], dest: 'build/' }
                ]
            }
        },
        json: {
            main: {
                options: {
                    namespace: 'settings',
                    includePath: false,
                    processName: function() {
                        return "config";
                    }
                },
                src: ['./settings.json'],
                dest: '.tmp/settings.js'
            }
        },
        clean: [".tmp"]
    });


    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-json');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['jshint', 'cssmin', 'json', 'uglify', 'replace', 'clean']);
};