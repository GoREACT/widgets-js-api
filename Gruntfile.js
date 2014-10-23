module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            // define the files to lint
            files: ['src/**/*.js']
        },
        uglify: {
            embedded: {
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
            embedded_min: {
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
            api: {
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
            widgets: {
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
                        'src/widgets/bootstrap.js'
                    ]
                }
            },
            build: {
                options: {
                    mangle: false,
                    compress: false,
                    preserveComments: 'some',
                    exportAll: true,
                    beautify: true,
                    report: 'gzip',
                    banner: '(function(){\n',
                    footer: '\n})();'
                },
                files: {
                    'build/widgets.js': [
                        '.tmp/widgets.js',
                        '.tmp/api.js'
                    ]
                }
            },
            build_min: {
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
};