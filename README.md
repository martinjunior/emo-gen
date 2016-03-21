# emo-gen

> A node style-guide generator

## Installation

```shell
npm install emo-gen --save-dev
```

## Overview

`emo-gen` aids in the developemnt of style-guides, providing a slim API by which a style-guide may be generated. At the time of this writing, `emo-gen` uses the [swig.js](http://paularmstrong.github.io/swig/) template engine. Future versions of `emo-gen` may support other template engines.

## Usage

After intalling `emo-gen`, you may include it in your project, like so.

```javascript
var StyleGuideGenerator = require('emo-gen');
```

`emo-gen` exposes the `StyleGuideGenerator` class, which makes available a number of methods. Let's look at the constructor.

### StyleGuideGenerator(options)

The `StyleGuideGenerator` constructor accepts one parameter (`options`).

Options:

- path (`Object`): an object containing a `src` and/or `dest` property
    - src (`String`): the location the styleguide source code is to be placed
    - dest (`String`): the location the styleguide will build to
- delimiters (`Array`): delimiters, within which, component documentation is expected to be written

Default options:

```javascript
StyleGuideGenerator.OPTIONS = {
    path: {
        src: 'styleguide/src/',
        dest: 'styleguide/dest/'
    },
    delimiters: ['{#', '#}']
};
```

### styleGuideGenerator.place()

Place the style-guide source in location specified by by `styleGuideGenerator.options.path.src`. Note that this method looks for an `index.html` in the specified source location. If it finds one, the style-guide source files won't be placed; otherwise, they will be. When using `emo-gen`, `styleGuideGenerator.place` must be ran before `styleGuideGenerator.build`.

The `place` method returns a promise.

Example:

```javascript
styleGuideGenerator.place().then(function() {
    // do something
});
```

### styleGuideGenerator.copy(files)

Copy the provided files. Know that `files` must be an array containing src-dest files mappings. `copy` returns a promise.

```javascript
var files = [{
    src: 'web/assets/styles/app.css',
    dest: 'styleguide/dest/assets/styles/app.css'
}];

styleGuideGenerator.copy(files).then(function() {
    // yay, files copied!
});
```

### styleGuideGenerator.scrape(files)

Scrape the provided files for component documentation. Said component documentation is used to generate the style-guide. The `file` parameter must be an array of file paths and/or glob patterns.

Returns a promise.

Example:

```javascript
var files = [
    'src/assets/scss/*.scss',
    'src/assets/scripts/*.js',
    'src/index.html'
];

styleGuideGenerator.scrape(files).then(function(components) {
    console.log(components); // [{ name: 'Btn', category: 'Modules', descrption: '<button></button>' }]
});
```

### styleGuideGenerator.build(components)

Build the style-guide of the provided components. `components` is expected to be the return value of `styleGuideGenerator.scrape`.

Example:

```javascript
styleGuideGenerator.scrape(files).then(function(components) {
    return styleGuideGenerator.build(components);
});
```

## A complete example

```javascript
var filesToScrape = ['src/assets/scss/**/*.scss'];
var filesToCopy = [{
    src: 'web/assets/styles/app.css',
    dest: 'styleguide/dest/assets/styles/app.css'
}];
var styleGuideGenerator = new StyleGuideGenerator();

styleGuideGenerator.place().then(function() {
    return styleGuideGenerator.copy(filesToCopy).then(function() {
        return styleGuideGenerator.scrape(filesToScrape).then(function(components) {
            return styleGuideGenerator.build(components);
        });
    }));
});

```

## Documentation Syntax

`emo-gen` was made to scrape documentation from source files. Within a given source file, documentation is expected to be written in [YAML](http://www.yaml.org/) and within the delimiters specified within `styleGuideGenerator.options.delimiters`. Example documentation follows.

```css
/*

{#

    name: Btn

    category: Content

    description: <button>I'm a button!<button>

#}

 */

.btn { ... }
```

Because writing a bunch of documentation in your source files isn't fun, `emo-gen` makes it possible to load external documentation from markdown files. Note that the specified path should be relative to the file in which it was written.

```css
/*

{#

    name: Btn

    category: Content

    description: relative/path/to/btn_docs.md 

#}

 */

.btn { ... }
```

`emo-gen` expects that all components use a `name` and `category` property. The `description` property will be used as the main body of a given components documentation. Beyond these properties, `emo-gen` will allow you to add properties as you wish.

```css
/*

{#

    name: Btn

    category: Content

    version: 1.0.0

    author: Some Person

    description: relative/path/to/btn_docs.md

#}

 */

.btn { ... }
```

## License

Licensed under MIT

## Release History
_(Nothing yet)_
