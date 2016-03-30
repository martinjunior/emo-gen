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
        var data = scraper.parse(content);

        return data.map(function(item) {
            return objectAssign(item, {
                _file: basename,
                _path: basepath
            });
        });
    };

    /**
     * Parse the provided content for yaml front matter;
     * if we don't initially find yaml front matter, it may
     * be within a comment block. If it is, get it from said
     * comment block, then parse it. The provided content may
     * contain multiple yaml front matter blocks.
     * 
     * @method scraper.parse
     * @param {String} content
     * @return {Array} a list of data
     */
    scraper.parse = function(content) {
        var data = []; // return data
        var frontMatter = parser.parseSync(content);
        // if we don't find any front matter data, it might be inside a comment block
        var insideCommentBlock = Object.keys(frontMatter.data).length === 0;

        if (!insideCommentBlock) {
            // imperatively assign the contents of the front matter object
            // as the description value of the first of the property of the
            // first and only object within the returned array
            data.push(objectAssign(frontMatter.data, {
                description: frontMatter.contents.toString('utf-8') // this is a buffer
            }));

            return data;
        }

        // since there was no data found on the front matter object,
        // there's a chance it's within a comment block; if we don't find
        // front matter, make sure we're stilld ealing with an array
        data = content.match(scraper.patterns.frontMatter) || data;

        // map the front matter blocks, because we
        // really only need their data value at this point
        return data.map(function(frontMatter) {
            return parser.parseSync(frontMatter).data;
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