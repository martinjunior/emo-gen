(function() {
    'use strict';

    var fs = require('fs');
    var path = require('path');
    var objectAssign = require('object-assign');
    var parser = require('parser-front-matter');

    /**
     * A tool that scrapes YAML from files
     * 
     * @class scraper
     * @static
     */
    var scraper = {};


    /**
     * A tool that scrapes front matter from source files
     * 
     * @method scraper.scrapeFiles
     * @param {Array} files  a list of files to scrape
     */
    scraper.scrapeFiles = function(files) {
        var data = [];

        if (!files) {
            return data;
        }

        files.filter(function(src) {
            return fs.lstatSync(src).isFile();
        }).map(function(src) {
            return scraper.scrapeFile(src);
        }).forEach(function(dataList) {
            if (!dataList) {
                return;
            }

            data = data.concat(dataList);
        });

        return data;
    };

    /**
     * Scrape the given file for YAML;
     * an array is returned, as the given src file
     * may contain multiple YAML blocks
     * 
     * @method scraper.scrapeFile
     * @param {String} src  a file path
     * @return {Array} a list of serialized front matter blocks
     */
    scraper.scrapeFile = function(src) {
        var basename = path.basename(src);
        var basepath = src.replace(basename, '');
        var content = fs.readFileSync(src, { encoding: 'utf8' });
        var listOfFrontMatter = content.match(scraper.patterns.frontMatter) || [];
        var data = listOfFrontMatter.map(function(frontMatter) {
            return parser.parseSync(frontMatter);
        });

        return data.map(function(item) {
            return objectAssign(item.data, {
                _file: basename,
                _path: basepath
            });
        });
    };

    /**
     * @property scraper.patterns
     */
    scraper.patterns = {
        frontMatter: new RegExp('^---$([\\s\\S]*?)^---$', 'mg')
    };

    module.exports = scraper;

} ());