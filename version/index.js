'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');

module.exports = AppGenerator

function AppGenerator(args, options, config) {
    yeoman.generators.NamedBase.apply(this, arguments);
}

util.inherits(AppGenerator, yeoman.generators.NamedBase);

AppGenerator.prototype.askFor = function () {
    var cb = this.async();
    var prompts = [
        {
            name: 'version',
            message: 'please input init version number ',
            default: '1.0',
            warning: '开始gallery之旅吧'
        }
    ];
    this.prompt(prompts
        , function (err, props) {
            if (err) {
                this.emit('error', err);
            }
            this.version = props.version;

            cb();
        }.bind(this));
}

AppGenerator.prototype.initVersionDir = function () {
    var componentName =  this.componentName = this.env.options.componentName;
    var version = this.version;
    if(componentName){
        version = componentName + '/' + version;
        this.template('abc.json',componentName + '/abc.json');
        this.version = this.version;

        this.template('_package.json',componentName + '/package.json');
        this.template('README.md',componentName + '/README.md');
    }else{
        this.writeJson('./abc.json',function(json){
            json.version = version;
            return json;
        });
        this.writeJson('./package.json',function(json){
            json.version = version;
            return json;
        });
    }

    mk(version,this);

    this.comConfig = comConfig(this);
    this.template('index.js', path.join(version, 'index.js'));
    this.template('index.md', path.join(version, 'guide', 'index.md'));
    this.template('index.html', path.join(version, 'demo', 'index.html'));
}

AppGenerator.prototype.writeJson = function(file,fnMap){
    if(!file || !fnMap) return false;
    var sAbcJson = this.readFileAsString(file);
    var oAbcJson = JSON.parse(sAbcJson);
    oAbcJson = fnMap.call(this,oAbcJson);
    this.write(file,JSON.stringify(oAbcJson));
}

function comConfig(that){
    var jsonFile = './abc.json';
    if(that.env.options.componentName){
        jsonFile = that.env.options.componentName + '/abc.json';
    }
    var sAbcJson = that.readFileAsString(jsonFile);
    var comConfig = JSON.parse(sAbcJson);
    var comName = comConfig.name;
    if(!comName) return false;
    var first = comName.substring(0,1).toUpperCase();
    var componentClass = first + comName.substring(1);
    comConfig.componentClass = componentClass;
    return comConfig;
}

function mk(version,that){
    if(!version) return false;
    that.mkdir(version);
    var fold = ['demo','doc','spec','build','plugin','guide'];
    for(var i=0;i<fold.length;i++){
        that.mkdir(path.join(version, fold[i]));
    }
}
