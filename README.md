# emo-gen

> A node style-guide generator

## Installation

```shell
npm install emo-gen --save-dev
```

## Overview

`emo-gen` aids in the developemnt of style-guides, providing a slim API by which a style-guide may be generated. At the time of this writing, `emo-gen` uses the [swig.js](http://paularmstrong.github.io/swig/) template engine. Future versions of `emo-gen` may support other template engines.

## Usage

After intalling `emo-gen`, you may include it in your project like so.

```javascript
var StyleGuideGenerator = require('emo-gen');
```

`emo-gen` exposes the `StyleGuideGenerator` class, which makes available a number of methods. Let's look at the constructor.

### StyleGuideGenerator(options)

The `StyleGuideGenerator` constructor accepts one parameter (`options`).

Options:

- path (`Object`): an object containing a `src` and/or `dest` property
    - src (`String`): the location where the style-guide source code is to be placed
    - dest (`String`): the location where the style-guide will build to
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

Place the style-guide source in the location specified by `styleGuideGenerator.options.path.src`. Note that this method looks for an `index.html` file in the specified source location. If it finds one, the style-guide source files will not be placed; otherwise, they will be. `styleGuideGenerator.place` must be ran before `styleGuideGenerator.build`.

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

Build the style-guide from the provided components. `components` is expected to take the form of the return value of `styleGuideGenerator.scrape`.

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

`emo-gen` was made to scrape documentation from source files. Within a given source file, documentation is expected to be written in [YAML](http://www.yaml.org/) and within the delimiters specified by `styleGuideGenerator.options.delimiters`. Example documentation follows.

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

`emo-gen` expects that all components use a `name` and `category` property; if a component does not use these two properties, it will not show up in the style-guide. The `description` property will be used as the main body of a given components documentation. Beyond these properties, `emo-gen` will allow you to add properties as you wish.

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

## The Source Files

The style-guide source directory contains the following.

```
----/styleguide/src/              <- default style-guide source directory
--------/assets/
------------/styles/
----------------/styleguide.css   <- the style-guide's styles
--------/layouts/
------------/default.html         <- swig layouts (see http://goo.gl/fD39tI)
--------/partials/
------------/_nav.html            <- the main navigation (renders component list)
--------/templates/
------------/component.html       <- the default component template
----/index.html                   <- the style-guide's homepage
```

## The Build

The style-guide destination folder will look as such.

```
----/styleguide/dest/             <- default style-guide dest directory
--------/assets/
------------/styles/
----------------/styleguide.css   <- the style-guide's styles
----------------/app.css          <- styles copied over
----/category/                    <- each category gets its own folder
--------/btn.html                 <- each component gets its own file
----/other-category/
--------/box.html
--------/card.html
----/third-category/
--------/anchor.html
----/index.html                   <- the style-guide's homepage
```

### The Build Process

For each component category found in your source file(s), `emo-gen` will create a new folder; within the view, categories will be listed in alphabetical order. One `.html` file will be created for each component.

Consider the following documention block.

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

The previous doc block will generate the following structure within the style-guide destination.

```
----/styleguide/dest/
--------/Content/
------------/Btn.html
```

#### Using a Custom Template

By default, components are built against the `components.html` template found in the style-guide `src` `templates` folder. To use a custom template, simply provide a `template` property in your doc block. The value of said property should be a relative path from the root of the style-guide `src` folder.

Example:

```css
/*

{#

    name: Btn

    category: Content

    template: templates/custom.html

    description: relative/path/to/btn_docs.md

#}

 */

.btn { ... }
```

#### Using a Custom Filename

By default, `emo-gen` will use a component's `name` property to construct its filename. Consider the following doc block.

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

The previous documentation will generate the following structure.

```
----/styleguide/dest/
----/Content/
--------/Btn.html                 <- notice how I'm named after my name
```

To change this default, apply a filename property to your doc block. Like so:

```css
/*

{#

    name: Btn

    category: Content

    filename: custom.html

    description: relative/path/to/btn_docs.md

#}

 */

.btn { ... }
```

### The View Models

During the build process (`styleGuideGenerator.build()`), two models are exposed to the templates: one to index.html and another to the component templates.

#### The Homepage (`index.html`) Model

```javascript
var data = {
    pathToRoot: '',           // a relative path to the index.html file
    components: components    // a list of all the components
};
```

#### The Component Model

This model is expose to each component template as the style-guide is being built.

```javascript
var data = {
    pathToRoot: '',           // a relative path to the index.html file
    component: component,     // the current component
    components: components    // a list of all the components
};
```

##### A Word on the `component` Property.

The component property will mirror the same model as the doc block that was used to create it.

Example:

```css
/*

{#

    name: Btn

    category: Content

    author: Some Person

    color: red

    number: 20

    description: relative/path/to/btn_docs.md

#}

 */

.btn { ... }
```

The previous doc block will generate the following component model.

```javascript
var component = {
    name: 'Btn',
    category: 'Content',
    author: 'Some Person',
    color: 'red',
    number: 20,
    description: 'relative/path/to/btn_docs.md'
};
```

This data is available to the templates via the `component` global.

## grunt-emo

`grunt-emo` is a Grunt wrapper for `emo-gen`, which makes using `emo-gen` easy. See [grunt-emo](https://github.com/martinjunior/emo)

## License

Licensed under MIT

## Release History
_(Nothing yet)_
