var pkg = require('./package.json')
    , moment = require('moment')

module.exports = function (shipit) {
    require('shipit-deploy')(shipit);

    shipit.initConfig({
        default: {
            workspace: '/tmp/' + pkg.name,
            deployTo: '/srv/nodejs/' + pkg.name,
            repositoryUrl: pkg.repository.url,
            ignores: ['.git', 'node_modules'],
            keepReleases: 5
        },
        production: {
            servers: ['nodejs@ec2-35-161-192-69.us-west-2.compute.amazonaws.com', 'nodejs@ec2-52-43-162-172.us-west-2.compute.amazonaws.com'],
            branch: 'master'
        },
        staging: {
            servers: ['nodejs@ec2-52-27-132-104.us-west-2.compute.amazonaws.com'],
            branch: 'stage'
        }
    });

    shipit.blTask('install', function (next) {
        shipit.remote('cd ' + this.currentPath + ' && npm install && npm prune', next);
        // var gulpTask = this.options.environment == 'production' ? 'tsc' : 'tsc';
        // shipit.remote('cd ' + this.currentPath + ' && npm install && npm prune', (err) => {
        //     if (err) return next(err);
        //     shipit.remote('cd ' + this.currentPath + ' && node_modules/.bin/gulp ' + gulpTask, (err) => {
        //         if (err) return next(err);
        //         next();
        //     });
        // });
    });


    shipit.blTask('restart', function (next) {
        var self = this
            , script = this.currentPath + '/bin/app.js'
            , startScript = 'source /home/nodejs/{env}; pm2 start {script}'
            , stopScript = 'pm2 delete {script}'
            , env = this.options.environment
            , envFile = (env === 'production') ? 'production.mibo.api.env' : 'stage.mibo.api.env'

        shipit.remote(stopScript.replace(/\{script\}/gi, script), function () {
            startScript = startScript.replace(/\{log\}/gi, '/var/log/nodejs/' + pkg.name + '.' + moment().format('YYYY-MM-DD') + '.log');
            startScript = startScript.replace(/\{outlog\}/gi, '/var/log/nodejs/' + pkg.name + '.out.' + moment().format('YYYY-MM-DD') + '.log');
            startScript = startScript.replace(/\{errorlog\}/gi, '/var/log/nodejs/' + pkg.name + '.error.' + moment().format('YYYY-MM-DD') + '.log');
            startScript = startScript.replace(/\{script\}/gi, script);
            startScript = startScript.replace(/\{env\}/gi, envFile);
            shipit.remote(startScript, next);
        });
    });

    shipit.on('published', function () {
        shipit.start('install', 'restart');
    });
};
