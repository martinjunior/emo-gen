# emo-gen

> A node style-guide generator

## Installation

```shell
npm install emo-gen --save-dev
```

## Overview

`emo-gen` aids in the developemnt of style-guides, providing a slim API by which a style-guide may be generated. `emo-gen` uses the [Nunjucks.js](https://mozilla.github.io/nunjucks/) template engine.

## Usage

After intalling `emo-gen`, you may include it in your project like so.

```javascript
var StyleGuideGenerator = require('emo-gen');
```

`emo-gen` exposes the `StyleGuideGenerator` class, which makes available a number of methods.

### StyleGuideGenerator(options)

The `StyleGuideGenerator` constructor accepts one parameter (`options`).

Options:

- path (`Object`): an object containing a `src` and/or `dest` property
    - src (`String`): the location where the style-guide source code is to be placed
    - dest (`String`): the location where the style-guide will build to

Default options:

```javascript
StyleGuideGenerator.OPTIONS = {
    path: {
        src: 'styleguide/src/',  // default
        dest: 'styleguide/dest/' // default
    }
};
```

### styleGuideGenerator.place()

Place the style-guide source in the location specified by `styleGuideGenerator.options.path.src`. Note that this method looks for an `index.html` file in the specified source location. If it finds one, the style-guide source files will not be placed; otherwise, they will be. `styleGuideGenerator.place` must run before `styleGuideGenerator.build`.

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

### styleGuideGenerator.build(componentFiles, viewDir, componentData)

Build the style-guide from the provided parameters. The `componentFiles` parameter must be a list of files and/or glob patterns (e.g., `['src/assets/scss/**']`). The `viewDir` parameter must be a relative path from the root of the style-guide source directory (`styleguide/src/` by default). `emo-gen` will treat all the `.html` files within the `viewDir` as static pages, building each one using Nunjucks api. `componentData` is an optional parameter that must take the shape of a component collection.

Example:

```javascript
var componentFiles = [
    'src/assets/scss/*.scss',
    'src/assets/scripts/*.js',
    'src/index.html'
];

var viewDir = 'views';

var componentData = [{
    name: 'colors',
    category: 'standards',
    description: 'docs/colors.md'
}];

styleGuideGenerator.build(componentFiles, viewDir, componentData).then(function() {
    // the style-guide was built!
});
```

## A complete example

```javascript
var componentFiles = ['src/assets/scss/**/*.scss'];
var filesToCopy = [{
    src: 'web/assets/styles/app.css',
    dest: 'styleguide/dest/assets/styles/app.css'
}];
var styleGuideGenerator = new StyleGuideGenerator();

styleGuideGenerator.place().then(function() {
    return styleGuideGenerator.copy(filesToCopy).then(function() {
        return styleGuideGenerator.build(componentFiles);
    }));
});

```

## Documentation Syntax

`emo-gen` was made to scrape documentation from source files. Within a given source file, documentation is expected to be written as [YAML](http://www.yaml.org/) front mattter. Example documentation follows.

```css
/*

---
name: Btn
category: Content
description: <button>I'm a button!<button>
---

 */

.btn { ... }
```

Because writing a bunch of documentation in your source files isn't fun, `emo-gen` makes it possible to load external documentation from markdown files. Note that the specified path should be relative to the file in which it was written.

```css
/*

---
name: Btn
category: Content
description: relative/path/to/btn_docs.md 
---

 */

.btn { ... }
```

`emo-gen` expects that all components use a `name`, `category`, and `description` property; if a component does not use these properties, it will not show up in the style-guide. The `description` property will be used as the main body of a given components documentation. Beyond these properties, `emo-gen` will allow you to add properties as you wish.

```css
/*

---
name: Btn
category: Content
version: 1.0.0
author: Some Person
description: relative/path/to/btn_docs.md
---

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

For each component category found in your source file(s), `emo-gen` will create a new folder; within the nav, categories will be listed in alphabetical order. One `.html` file will be created for each component.

Consider the following documention block.

```css
/*

---
name: Btn
category: Content
description: relative/path/to/btn_docs.md
---

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

---
name: Btn
category: Content
template: templates/custom.html
description: relative/path/to/btn_docs.md
---

 */

.btn { ... }
```

#### Using a Custom Filename

By default, `emo-gen` will use a component's `name` property to construct its filename. Consider the following doc block.

```css
/*

---
name: Btn
category: Content
description: relative/path/to/btn_docs.md
---

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

---
name: Btn
category: Content
filename: custom.html
description: relative/path/to/btn_docs.md
---

 */

.btn { ... }
```

### The View Models

During the build process (`styleGuideGenerator.build()`), three models are exposed to the templates: one to index.html, another to the component templates, and a third to the views.

#### The Homepage (`index.html`) Model

```javascript
var data = {
    pathToRoot: '',           // a relative path to the index.html file
    components: components,   // a list of all the components,
    views: views              // a list of all the views
};
```

#### The Component Model

This model is exposed to each component template as the style-guide is being built.

```javascript
var data = {
    pathToRoot: '../',        // a relative path to the index.html file
    component: component,     // the current component
    components: components,   // a list of all the components,
    views: views              // a list of all the views
};
```

##### A Word on the `component` Property.

The component property will mirror the same model as the doc block that was used to create it.

Example:

```css
/*

---
name: Btn
category: Content
author: Some Person
color: red
number: 20
description: relative/path/to/btn_docs.md
---

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
    description: '<button>/<button>'  // the contents of relative/path/to/btn_docs.md
};
```

This data is available to the templates via the `component` global.

#### The View Model

This model is exposed to each view as the style-guide is being built.

```javascript
var data = {
    pathToRoot: '../',        // a relative path to the index.html file
    view: view,               // the current view
    components: components,   // a list of all the components,
    views: views              // a list of all the views
};
```

## grunt-emo

`grunt-emo` is a Grunt wrapper for `emo-gen`, which makes using `emo-gen` easy. See [grunt-emo](https://github.com/martinjunior/emo) for more details.

## License

Licensed under MIT

## Release History
_(Nothing yet)_
