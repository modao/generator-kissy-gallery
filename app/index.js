'use strict';
var util = require('util');
var path = require('path');
var generator = require('abc-generator');
var fs = require('fs');

module.exports = Gallery;
function Gallery(args, options, config) {
    generator.UIBase.apply(this, arguments);
    this.version = args[0] || '1.0';
    this.cwd = options.env.cwd;
    this.componentName = getComName(this);

    if (fs.existsSync('abc.json')) {
        this.abcJSON = JSON.parse(this.readFileAsString('abc.json'));
    } else {
        this.abcJSON = {}
    }

    this.on('end',function(){
        this.installDependencies();
        console.log("组件目录和文件初始化完成！")
        console.log("\n打包组件运行：")
        console.log('grunt')
    })
}

util.inherits(Gallery, generator.UIBase);

var prt = Gallery.prototype;

prt.askFor = function(){
    //打印欢迎消息
    console.log(this.abcLogo);
}
prt.askAuthor = function(){
    var cb = this.async();

    var author = {
        name: 'kissy-team',
        email: 'kissy-team@gmail.com'
    };

    if (this.abcJSON && this.abcJSON.author) {
        var abcAuthor = this.abcJSON.author;
        author.name = abcAuthor.name || 'kissy-team';
        author.email = abcAuthor.email || 'kissy-team@gmail.com';
    }

    var prompts = [{
        name: 'author',
        message: 'author of component:',
        default: author.name
    },{
        name: 'email',
        message: 'email of author:',
        default: author.email
    }];

    this.prompt(prompts, function (props) {
        this.author = props.author;
        this.email = props.email;
        cb();
    }.bind(this));
}
prt.copyFile = function(){
    this.copy('Gruntfile.js','Gruntfile.js');
    this.copy('_.gitignore','.gitignore');
    this.template('abc.json','abc.json');
    this.template('_package.json','package.json');
    this.template('README.md', 'README.md');

}

prt.mk = function(){
    var version = this.version;
    this.mkdir(version);
    var fold = ['demo','spec','build','plugin','guide','meta'];
    for(var i=0;i<fold.length;i++){
        this.mkdir(path.join(version, fold[i]));
    }
}

prt.createVersion = function(){
    var version = this.version;
    this.comConfig = comConfig(this);
    this.template('index.js', path.join(version, 'index.js'));
    this.template('alias.js', path.join(version, 'meta','alias.js'));
    this.template('modules.js', path.join(version, 'meta','modules.js'));
    this.template('index.md', path.join(version, 'guide', 'index.md'));
    this.template('index.html', path.join(version, 'demo', 'index.html'));
}

/**
 * Scan Project
 */
prt._scan = function _scan() {
  // fix windows path
  var versionMatch = path.join('*.*/');
  var versions = this.expand(versionMatch);

  var abc = JSON.parse(this.readFileAsString('abc.json'));
  var version = abc.version;

  versions = versions.

    filter(function(v){
      return /^(\d.\d)/.test(v);
    }).
    map(function(v) {
    v = v.match(/^(\d.\d)/)[1];
    return {
      version: v,
      current: v === version
    }
  });
  console.log(versions);

  return {
    versions: versions
  };

};

function getComName(that){
    var root = that.cwd;
    return path.basename(root);
}

function comConfig(that){
    var jsonFile = './abc.json';
    var sAbcJson = that.readFileAsString(jsonFile);
    var comConfig = JSON.parse(sAbcJson);
    var comName = comConfig.name;
    if(!comName) return false;
    var first = comName.substring(0,1).toUpperCase();
    var componentClass = first + comName.substring(1);
    comConfig.componentClass = componentClass;
    return comConfig;
}
