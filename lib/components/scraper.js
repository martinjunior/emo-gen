(function() {
    'use strict';

    var fs = require('fs');
    var path = require('path');
    var yaml = require('js-yaml');
    var objectAssign = require('object-assign');

    var scraper = {};

    scraper.scrapeFiles = function(files, delimiters) {
        var data = [];

        if (!files || !delimiters) {
            return data;
        }

        files.filter(function(src) {
            return fs.lstatSync(src).isFile();
        }).map(function(src) {
            return scraper.scrapeFile(src, delimiters);
        }).forEach(function(dataList) {
            if (!dataList) {
                return;
            }

            data = data.concat(dataList);
        });

        return data;
    };

    scraper.scrapeFile = function(src, delimiters) {
        var basename = path.basename(src);
        var basepath = src.replace(basename, '');
        var content = fs.readFileSync(src, { encoding: 'utf8' });
        var pattern = scraper.patterns.docs(delimiters[0], delimiters[1]);
        var data = scraper.serialize(content.match(pattern), delimiters);

        return data.map(function(item) {
            return objectAssign(item, {
                _file: basename,
                _path: basepath
            });
        });
    };

    scraper.serialize = function(content, delimiters) {
        var data = [];

        if (!content) {
            return data;
        }

        data = content.map(function(text) {
            return yaml.safeLoad(
                text
                    .replace(scraper.patterns.delimiter.open(delimiters[0]), '')
                    .replace(scraper.patterns.delimiter.close(delimiters[1]), '')
            );
        }.bind(this));

        return data;
    };

    scraper.patterns = {
        docs: function(open, close) {
            var pattern = new RegExp(
                open + '((?!(' + open + '|' + close + '))[\\s\\S])+' + close, 'g'
            );

            return pattern;
        },
        delimiter: {
            open: function(delimiter) {
                var pattern = new RegExp('^' + delimiter);
                
                return pattern;
            },
            close: function(delimiter) {
                var pattern = new RegExp(delimiter + '$');
                
                return pattern;
            }
        }
    };

    module.exports = scraper;

} ());