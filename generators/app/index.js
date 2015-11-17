'use strict';
var yeoman = require('yeoman-generator');
var yaml = require('yamljs');
var sort = require('sort-object');
var mergeAndConcat = require('merge-and-concat');
var travisConfigKeys = require('travis-config-keys');
var ramda = require('ramda');

function sortByKeys(a, b) {
  return travisConfigKeys.indexOf(a) < travisConfigKeys.indexOf(b) ? -1 : 1;
}

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    // destination path
    this.option('path', {
      type: String,
      required: false,
      defaults: '',
      desc: 'Use an other destination path.'
    });
  },

  writing: {
    app: function () {
      var optional =  this.options.config || {};
      var existing = this.fs.exists(this.destinationPath(this.options.path, '.travis.yml'))
            ? yaml.parse(this.fs.read(this.destinationPath(this.options.path, '.travis.yml')))
            : {};
      var defaults = yaml.parse(this.fs.read(this.templatePath('travisyml')));
      var results = mergeAndConcat(existing, optional, defaults);
      var sortedResults = sort(results, { sort: sortByKeys });
      sortedResults.node_js = ramda.uniq(sortedResults.node_js);
      this.fs.write(
        this.destinationPath(this.options.path, '.travis.yml'),
        yaml.stringify(sortedResults, 3, 2)
      );
    },
  },
});
