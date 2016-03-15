'use strict';
var generators      = require('yeoman-generator'),
    chalk           = require('chalk'),
    yosay           = require('yosay'),
    _               = require('lodash'),
    extend          = _.merge,
    parseAuthor     = require('parse-author'),
    githubUsername  = require('github-username'),
    path            = require('path'),
    askName         = require('inquirer-npm-name')

module.exports = generators.Base.extend({

  initializing: function () {
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

    this.props = {
      name: this.pkg.name,
      description: this.pkg.description,
      version: this.pkg.version,
      homepage: this.pkg.homepage
    };

    if (_.isObject(this.pkg.author)) {
      this.props.authorName = this.pkg.author.name;
      this.props.authorEmail = this.pkg.author.email;
    } else if (_.isString(this.pkg.author)) {
      var info = parseAuthor(this.pkg.author);
      this.props.authorName = info.name;
      this.props.authorEmail = info.email;
    }
  },

  prompting: {
    askFor: function () {
      var done = this.async();

      var prompts = [{
        name: 'name',
        message: 'Project Name',
        when: !this.props.name
      }, {
        name: 'description',
        message: 'Description',
        when: !this.props.description
      }, {
        name: 'authorName',
        message: 'Author\'s Name',
        when: !this.props.authorName,
        default: this.user.git.name(),
        // store: true
      }, {
        name: 'authorEmail',
        message: 'Author\'s Email',
        when: !this.props.authorEmail,
        default: this.user.git.email(),
        // store: true
      }];

      this.prompt(prompts, function (props) {
        this.props = extend(this.props, props);
        done();
      }.bind(this));
    },
  },


  writing: {
    gulpfile: function () {
      this.fs.copy(
        this.templatePath('gulpfile.js'),
        this.destinationPath('gulpfile.js'));
    },

    packageJSON: function () {
      this.fs.copy(
        this.templatePath('package.json'),
        this.destinationPath('package.json')
      );

      var currentPkg = this.fs.readJSON(this.destinationPath('package.json'), {});

      var pkg = extend({
        name: _.kebabCase(this.props.name),
        version: '0.1.0',
        description: this.props.description,
        homepage: this.props.homepage,
        author: {
          name: this.props.authorName,
          email: this.props.authorEmail,
        },
      }, currentPkg);

      this.fs.writeJSON(this.destinationPath('package.json'), pkg);
    },

    git: function () {
      this.fs.copy(
        this.templatePath('.gitignore'),
        this.destinationPath('.gitignore'));

    },

    copy: function () {
      this.fs.copy(
        this.templatePath('src/**/*'),
        this.destinationPath('src/')
      );


    },

    readme: function () {
      this.fs.copyTpl(
        this.templatePath('README.md'),
        this.destinationPath('README.md'),
        {
          projectName: this.props.name,
          description: this.props.description
        }
      );
    }
  },

  install: {
    // normalize: function() {
    //   this.bowerInstall(['JohnAlbin/normalize-scss']);
    // },
    // flxgird: function () {
    //   this.bowerInstall(['colorlight4/flx-grid-scss']);
    // },
    npm: function () {
      this.npmInstall();
    }
  },

  end: function () {
      // this.fs.copy(
      //   this.templatePath('bower_components/normalize-scss/sass/**/*'),
      //   this.destinationPath('src/scss/vendor/'));
      // this.fs.copy(
      //   this.templatePath('bower_components/flx-grid-scss/*'),
      //   this.destinationPath('src/scss/vendor/flx-grid-scss/'));
  }

});