'use strict';
var generators  = require('yeoman-generator'),
    wiredep     = require('wiredep'),
    mkdirp      = require('mkdirp'),
    _           = require('lodash'),
    extend      = _.merge

module.exports = generators.Base.extend({
  constructor: function () {

    generators.Base.apply(this, arguments);

    this.option('skip-install-message', {
      desc: 'Skips the message after the installation of dependencies',
      type: Boolean
    });

    this.option('module', {
      desc: 'use this as a module',
      type: Boolean,
      defaults: false
    });
  },

  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: {

    askFor: function () {
      var done = this.async();

      var prompts = [{
        name: 'name',
        message: 'Project Name',
      }, {
        name: 'description',
        message: 'Description',
      }, {
        name: 'url',
        message: 'Project Website',
      }, {
        name: 'authorName',
        message: 'Author\'s Name',
        default: this.user.git.name()
      }, {
        name: 'authorEmail',
        message: 'Author\'s Email',
        default: this.user.git.email()
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
        message: 'use jade instead of kit?',
        default: false
      }];

      this.prompt(prompts, function (answers) {
        var features = answers.features;

        function hasFeature(feat) {
          return features && features.indexOf(feat) !== -1;
        };

        this.includeFlxGrid     = hasFeature('includeFlxGrid');
        this.includeModernizr   = hasFeature('includeModernizr');
        this.includeJQuery      = hasFeature('includeJQuery');
        this.useJade            = answers.useJade;

        done();
      }.bind(this));
    }
  },

  writing: {
    gulpfile: function () {
      this.fs.copyTpl(
        this.templatePath('gulpfile.js'),
        this.destinationPath('gulpfile.js'),
        {
          useJade: this.useJade,
          module: this.options['module']
        });
    },

    packageJSON: function () {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        {
          useJade: this.useJade,
          module: this.options['module']
        }
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

    git: function () {
      this.fs.copy(
        this.templatePath('.gitignore'),
        this.destinationPath('.gitignore'));
    },

    bower: function () {
      var bowerJson = {
        name: _.kebabCase(this.props.name),
        version: '0.1.0',
        dependencies: {}
      };

      if (this.includeFlxGrid) {
        bowerJson.dependencies['flx-grid-scss'] = 'colorlight4/flx-grid-scss';
        var overrides = extend({
          overrides: {
              "flx-grid-scss": {
                "main": [
                  "flx-grid.scss"]}}
        }, bowerJson);
      }

      if (this.includeJQuery) {
        bowerJson.dependencies['jquery'] = '^2.2.2';
      }

      if (this.includeModernizr) {
        bowerJson.dependencies['modernizr'] = '^3.3.1';
      }

      if (!this.options['module']) {
       bowerJson.dependencies['normalize.scss'] = '4.0.3'; 
      }

      this.fs.writeJSON('bower.json', bowerJson);

      this.fs.copy(
        this.templatePath('.bowerrc'),
        this.destinationPath('.bowerrc'));
    },

    rootCopy: function () {
      this.fs.copy(
        this.templatePath('src/root/**/*'),
        this.destinationPath('src/root/'));
    },

    styles: function () {
      this.fs.copy(
        this.templatePath('src/scss/**/*'),
        this.destinationPath('src/scss/')
      );
    },

    scripts: function () {
      this.fs.copy(
        this.templatePath('src/js/**/*'),
        this.destinationPath('src/js/')
      );
    },

    tmpl: function () {
      var tmplLang = 'kit';
      if (this.useJade) {
        tmplLang = 'jade';
      }

      this.fs.copyTpl(
        this.templatePath('src/'+tmplLang+'/**/*'),
        this.destinationPath('src/'+tmplLang+'/'),
        {
          name: this.props.name,
          description: this.props.description,
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
      mkdirp('src/img');
      mkdirp('src/fonts');
    }
  },

  install: function () {
    this.installDependencies({
      skipMessage: this.options['skip-install-message'],
      skipInstall: this.options['skip-install']
    });
  },

  end: function () {
    var bowerJson = this.fs.readJSON(this.destinationPath('bower.json'));

    wiredep({
      src: ['src/jade/partials/head.jade', 'src/kit/partials/head.kit', 'src/scss/main.scss'],

      onError : function(err) {
            console.log("Wiredep error: "+err);
      },
      onFileUpdated : function (filePath) {
          console.log('File path was updated: ' + filePath);
      },
      onPathInjected : function (fileObject) {
          console.log('Path injected: ' + JSON.stringify(fileObject));
      },

      filetype: {
        kit: {
          block: /(([ \t]*)<!--\s*bower:*(\S*)\s*-->)(\n|\r|.)*?(<!--\s*endbower\s*-->)/gi,
          detect: {
            js: /<script.*src=['"]([^'"]+)/gi,
            css: /<link.*href=['"]([^'"]+)/gi
          },
          replace: {
            js: '<script src="{{filePath}}"></script>',
            css: '<link rel="stylesheet" href="{{filePath}}" />'
          }
        }
      }
    });
  }
});