'use strict';
var generators  = require('yeoman-generator'),
    yosay       = require('yosay'),
    chalk       = require('chalk'),
    wiredep     = require('wiredep'),
    mkdirp      = require('mkdirp'),
    _s          = require('underscore.string'),
    parseAuthor = require('parse-author'),

    _       = require('lodash'),
    extend  = _.merge

module.exports = generators.Base.extend({
  constructor: function () {

    generators.Base.apply(this, arguments);

    this.option('skip-welcome-message', {
      desc: 'Skips the welcome message',
      type: Boolean
    });

    this.option('skip-install-message', {
      desc: 'Skips the message after the installation of dependencies',
      type: Boolean
    });

    this.option('babel', {
      desc: 'Use Babel',
      type: Boolean,
      defaults: true
    });
  },

  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: {

    askFor: function () {
      var done = this.async();

      // if (!this.options['skip-welcome-message']) {
      //   this.log(yosay('\'Allo \'allo! Out of the box I include HTML5 Boilerplate, jQuery, and a gulpfile to build your app.'));
      // }

      var prompts = [{
        name: 'name',
        message: 'Project Name',
        default: 'name',
      }, {
        name: 'description',
        message: 'Description',
        default: 'discription',
      }, {
        name: 'url',
        message: 'Project Website',
        default: '#',
      }, {
        name: 'authorName',
        message: 'Author\'s Name',
        // default: this.user.git.name(),
        default: 'author',
        // store: true
      }, {
        name: 'authorEmail',
        message: 'Author\'s Email',
        // default: this.user.git.mail(),
        default: 'email',
        // store: true
      }];

      this.prompt(prompts, function (props) {
        this.props = extend(this.props, props);
        done();
      }.bind(this));
    },

    askIncludes: function () {
      var done = this.async();

      var prompts = [{
        type: 'checkbox',
        name: 'features',
        message: 'What more would you like?',
        choices: [{
          name: 'flx-grid',
          value: 'includeFlxGrid',
          checked: true
        }, {
          name: 'Modernizr',
          value: 'includeModernizr',
          checked: false
        }, {
          name: 'jQuery',
          value: 'includeJQuery',
          checked: false
        }]
      }, {
        type: 'confirm',
        name: 'useJade',
        message: 'Would you like to use jade instead of kit?',
        default: false
      }, {
        type: 'confirm',
        name: 'globalReset',
        message: 'global useragent reset?',
        default: false
      // }, {
      //   type: 'confirm',
      //   name: 'includeJQuery',
      //   message: 'Would you like to include jQuery?',
      //   default: false
      }];

      this.prompt(prompts, function (answers) {
        var features = answers.features;

        function hasFeature(feat) {
          return features && features.indexOf(feat) !== -1;
        };

        this.includeFlxGrid     = hasFeature('includeFlxGrid');
        this.includeModernizr   = hasFeature('includeModernizr');
        this.includeJQuery      = hasFeature('includeModernizr');
        this.useJade            = answers.useJade;
        this.globalReset        = answers.globalReset;

        done();
      }.bind(this));
    }
  },

  writing: {
    gulpfile: function () {
      this.fs.copyTpl(
        this.templatePath('gulpfile.js'),
        this.destinationPath('gulpfile.js'));
    },

    packageJSON: function () {
      this.fs.copy(
        this.templatePath('_package.json'),
        this.destinationPath('package.json')
        // {
        //   includeSass: this.includeSass,
        //   includeBabel: this.options['babel']
        // }
      );

      var currentPkg = this.fs.readJSON(this.destinationPath('package.json'), {});

      var pkg = extend({
        name: _.kebabCase(this.props.name),
        version: '0.1.0',
        description: this.props.description,
        homepage: this.props.url,
        author: {
          name: this.props.authorName,
          email: this.props.authorEmail,
        },
      }, currentPkg);

      this.fs.writeJSON(this.destinationPath('package.json'), pkg);
    },

    babel: function () {
      this.fs.copy(
        this.templatePath('.babelrc'),
        this.destinationPath('.babelrc')
      );
    },

    git: function () {
      this.fs.copy(
        this.templatePath('.gitignore'),
        this.destinationPath('.gitignore'));
    },

    bower: function () {
      var bowerJson = {
        name: _s.slugify(this.props.name),
        version: '0.1.0',
        dependencies: {}
      };

      if (this.includeFlxGrid) {
        bowerJson.dependencies['flx-grid'] = 'colorlight4/flx-grid-scss';
      }

      if (this.includeJQuery) {
        bowerJson.dependencies['jquery'] = '~2.1.1';
      }

      if (this.includeModernizr) {
        bowerJson.dependencies['modernizr'] = '~2.8.1';
      }

      this.fs.writeJSON('bower.json', bowerJson);

      this.fs.copy(
        this.templatePath('.bowerrc'),
        this.destinationPath('.bowerrc'));
    },

    rootCopy: function () {
      this.fs.copy(
        this.templatePath('src/root/*'),
        this.destinationPath('src/root/'));
    },

    styles: function () {
      this.fs.copy(
        this.templatePath('src/scss/**/*'),
        this.destinationPath('src/scss/')
        // ,
        // {
        //   includeBootstrap: this.includeBootstrap
        // }
      );
    },

    scripts: function () {
      this.fs.copy(
        this.templatePath('src/js/**/*'),
        this.destinationPath('src/js/')
      );
    },

    html: function () {

      this.fs.copyTpl(
        this.templatePath('src/kit/**/*'),
        this.destinationPath('src/kit/'),
        {
          name: this.props.name,
          discription: this.props.discription,
          url: this.props.url
        }
      );
    },

    readme: function () {
      this.fs.copyTpl(
        this.templatePath('README.md'),
        this.destinationPath('README.md'),
        {
          projectName: this.props.name,
          description: this.props.description
        });
    },

    misc: function () {
      mkdirp('src/images');
      mkdirp('src/fonts');
    }
  },

  install: function () {
    // this.installNpm();
    this.installDependencies({
      skipMessage: this.options['skip-install-message'],
      skipInstall: this.options['skip-install']
    });
  },

  end: function () {
    var bowerJson = this.fs.readJSON(this.destinationPath('bower.json'));
    var howToInstall =
      '\nAfter running ' +
      chalk.yellow.bold('npm install & bower install') +
      ', inject your' +
      '\nfront end dependencies by running ' +
      chalk.yellow.bold('gulp wiredep') +
      '.';

    if (this.options['skip-install']) {
      this.log(howToInstall);
      return;
    }

    // wire Bower packages to .html
    // wiredep({
    //   bowerJson: bowerJson,
    //   directory: 'bower_components',
    //   exclude: ['bootstrap-sass', 'bootstrap.js'],
    //   ignorePath: /^(\.\.\/)*\.\./,
    //   src: 'app/index.html'
    // });

    // if (this.includeSass) {
      // wire Bower packages to .scss
      wiredep({
        bowerJson: bowerJson,
        directory: 'src/bower_components',
        ignorePath: /^(\.\.\/)+/,
        src: 'src/scss/*.scss'
      });
    // }
  }
});
