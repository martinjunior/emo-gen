/*!
 * expand-utils <https://github.com/jonschlinkert/expand-utils>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Module dependencies
 */

require('isobject', 'isObject');
require('extend-shallow', 'extend');
require('define-property', 'define');
require = fn;

/**
 * Utils
 */

utils.is = function(obj, name) {
  var key = name.charAt(0).toUpperCase() + name.slice(1);
  utils.define(obj, 'is' + key, true);
  utils.define(obj, 'is', name);
};

/**
 * Run plugins on `child` in the `parent`'s' context.
 */

utils.run = function(parent, key, child) {
  if (!parent.hasOwnProperty('run') || typeof parent.run !== 'function') {
    var val = JSON.stringify(parent);
    throw new TypeError('expected `' + val + '` to have a "run" method');
  }

  utils.define(child, 'parent', parent);
  utils.is(child, key);

  parent.run(child);
  delete child[key];
};

/**
 * Return true if the given value has "Config" properties
 */

utils.isConfig = function(config) {
  if (!utils.isObject(config)) {
    return false;
  }
  if (utils.isTask(config)) {
    return true;
  }
  if (utils.isTarget(config)) {
    return true;
  }
  for (var key in config) {
    if (utils.isTask(config[key])) {
      return true;
    }
  }
  return false;
};

/**
 * Return true if the given value has "task" properties
 */

utils.isTask = function(config) {
  if (!utils.isObject(config)) {
    return false;
  }
  if (config.isTask === true) {
    return true;
  }
  if (utils.isFiles(config)) {
    return false;
  }
  if (utils.isTarget(config)) {
    return false;
  }
  for (var key in config) {
    if (utils.isTarget(config[key])) {
      return true;
    }
  }
  return false;
};

/**
 * Return true if the given value is a "target"
 */

utils.isTarget = function(config) {
  if (!utils.isObject(config)) {
    return false;
  }
  if (config.isTarget === true) {
    return true;
  }
  if (utils.hasFilesProps(config)) {
    return true;
  }
  return false;
};

/**
 * Return true if the given value is an object that has
 * "ExpandFiles" characteristics or file properties
 */

utils.isFiles = function(config) {
  if (!utils.isObject(config)) {
    return false;
  }
  if (config.isFiles === true) {
    return true;
  }
  if (utils.hasFilesProps(config)) {
    return true;
  }
  return false;
};

/**
 * Return true if the given value is an object that has
 * src, dest or files properties.
 */

utils.hasFilesProps = function(config) {
  if (!utils.isObject(config)) {
    return false;
  }
  if (config.hasOwnProperty('files')) {
    return true;
  }
  if (config.hasOwnProperty('src')) {
    return true;
  }
  if (config.hasOwnProperty('dest')) {
    return true;
  }
  return false;
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
