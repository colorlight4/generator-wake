'use strict';
var   yeoman  = require('yeoman-generator'),
      chalk   = require('chalk'),
      yosay   = require('yosay');

module.exports = require('yeoman-generator').Base.extend({
  // prompting: function () {
  //   var done = this.async();

  //   // Have Yeoman greet the user.
  //   this.log(yosay(
  //     'Welcome to the bee\'s knees ' + chalk.red('') + ' generator!'
  //   ));

  //   // var prompts = [{
  //   //   type: 'confirm',
  //   //   name: 'someOption',
  //   //   message: 'Would you like to enable this option?',
  //   //   default: true
  //   // }];

  //   // this.prompt(prompts, function (props) {
  //   //   this.props = props;
  //   //   // To access props later use this.props.someOption;

  //   //   done();
  //   // }.bind(this));
  // },

  writing: function () {
    this.fs.copy(
      this.templatePath('src/**/*'),
      this.destinationPath('src/')
    );
    this.fs.copy(
      this.templatePath('package.json'),
      this.destinationPath('package.json')
    );
    this.fs.copy(
      this.templatePath('gulpfile.js'),
      this.destinationPath('gulpfile.js')
    );
    this.fs.copy(
      this.templatePath('gulpfile.js'),
      this.destinationPath('gulpfile.js')
    );
    this.fs.copy(
      this.templatePath('README.md'),
      this.destinationPath('README.md')
    );
    this.fs.copy(
      this.templatePath('.gitignore'),
      this.destinationPath('.gitignore')
    );
    this.fs.copyTpl(
      this.templatePath('git://github.com/colorlight4/flx-grid.scss.git'),
      this.destinationPath('src/scss/vendor/_flx-grid.scss')
    );
    // this.fs.copy(
    //   this.templatePath('.gitignore'),
    //   this.destinationPath('.gitignore')
    // );
  }

  // install: function () {
  //   this.npmInstall();
  //   // this.bowerInstall(['git://github.com/colorlight4/flx-grid.scss.git']);
  // },
});
