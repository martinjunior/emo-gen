(function() {
    'use strict';

    var fs = require('fs');
    var path = require('path');
    var yaml = require('js-yaml');
    var objectAssign = require('object-assign');

    /**
     * A tool that scrapes YAML from files
     * 
     * @class scraper
     * @static
     */
    var scraper = {};


    /**
     * A tool that scrapes YAML from files;
     * the YAML is expected to be contained
     * within the provided delimiters
     * 
     * @method scraper.scrapeFiles
     * @param {Array} files  a list of files to scrape
     * @param {Array} delimiters  open and close delimiters
     */
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

    /**
     * Scrape the given file for YAML;
     * an array is returned, as the given src file
     * may contain multiple YAML blocks
     * 
     * @method scraper.scrapeFile
     * @param {String} src  a file path
     * @param {Array} delimiters  open and close delimiters
     * @return {Array} a list of serialized YAML blocks
     */
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

    /**
     * Parse the provided content as YAML
     * 
     * @method scraper.serialize
     * @param {Array} content  a list of YAML
     * @param {Array} delimiters  open and close delimiters
     * @return {Array} a list of parsed YAML
     */
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

    /**
     * Helper methods used by scraper;
     * these methods construct regular expressions
     * used to gather and parse YAML
     * 
     * @property scraper.patterns
     */
    scraper.patterns = {

        /**
         * Return a regular expression suitable
         * for matching documentation blocks
         * (denoted by open and close delimiters)
         *
         * @method scraper.patterns.docs
         * @param {String} open  open delmiter
         * @param {String} close  close delmiter
         * @return {Object} regular expression
         */
        docs: function(open, close) {
            var pattern = new RegExp(
                open + '((?!(' + open + '|' + close + '))[\\s\\S])+' + close, 'g'
            );

            return pattern;
        },

        /**
         * @property scraper.patterns.delimiter
         */
        delimiter: {

            /**
             * Return a regular expression suitable
             * for matching the provided open delimiter
             * 
             * @param {String} delimiter  open delimiter
             * @return {Object} regular expression
             */
            open: function(delimiter) {
                var pattern = new RegExp('^' + delimiter);
                
                return pattern;
            },

            /**
             * Return a regular expression suitable
             * for matching the provided close delimiter
             * 
             * @param {String} delimiter  close delimiter
             * @return {Object} regular expression
             */
            close: function(delimiter) {
                var pattern = new RegExp(delimiter + '$');
                
                return pattern;
            }
        }
    };

    module.exports = scraper;

} ());