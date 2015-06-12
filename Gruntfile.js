module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: grunt.file.readJSON('config.json'),
        jshint: {
            // define the files to lint
            files: ['src/**/*.js']
        },
        uglify: {
            // :: embedded-dot-syntax.js
            build_embedded: {
                options: {
                    mangle: false,
                    compress: false,
                    preserveComments: 'some',
                    beautify: true,
                    report: 'gzip'
                },
                files: {
                    'build/embed.js': [
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
                    'build/embed.min.js': [
                        'src/embedded/dot-syntax.js'
                    ]
                }
            },

            // :: widgets.js ::
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
                        'src/widgets/api/*.js'
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
                        'src/widgets/utils.js',
                        'src/widgets/transient.js',
                        'src/widgets/polyfill.js',
                        'src/widgets/dispatcher.js',
                        'src/widgets/factory.js',
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
                    banner: '(function(window, undefined){\n',
                    footer: '\n}).bind(window)(window);'
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
                        { match: 'widgetsUrl', replacement: '<%= config.widgetsUrl %>' },
                        { match: 'sandboxUrl', replacement: '<%= config.sandboxUrl %>' },
                        { match: 'devUrl', replacement: '<%= config.devUrl %>' },
                        { match: 'prodUrl', replacement: '<%= config.prodUrl %>' },
                        { match: 'authUri', replacement: '<%= config.authUri %>' },
                        { match: 'recordUri', replacement: '<%= config.recordUri %>' },
                        { match: 'uploadUri', replacement: '<%= config.uploadUri %>' },
                        { match: 'playbackUri', replacement: '<%= config.playbackUri %>' },
                        { match: 'reviewUri', replacement: '<%= config.reviewUri %>' },
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
        clean: [".tmp"]
    });


    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['jshint', 'cssmin', 'uglify', 'replace', 'clean']);
};