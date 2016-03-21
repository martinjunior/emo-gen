# emo-gen

> A node style-guide generator

## Installation

```shell
npm install emo-gen --save-dev
```

## Overview

`emo-gen` aids in the developemnt of style-guides, providing a slim API by which a style-guide may be generated. At the time of this writing, `emo-gen` uses the [swig.js](http://paularmstrong.github.io/swig/) template engine. Future version of `emo-gen` may support other template engines.

## Usage

As mentioned, `emo-gen` is a node module. After intalling `emo-gen`, you may include it in your project, like so.

```javascript
var StyleGuideGenerator = require('emo-gen');
```

`emo-gen` exposes the `StyleGuideGenerator` class, which makes available a number of methods. First, let's look at the constructor.

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

## License

Licensed under MIT

## Release History
_(Nothing yet)_
