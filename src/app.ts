import * as console from 'console';
import apiApp from './api';
import webApp from './web';
import db from './db';
import * as minimist from 'minimist';


let argv = minimist(process.argv.slice(2));
let apps = {
    'api': apiApp,
    'web': webApp
}

let printUsage = () => {
    console.log('usage: node app --start api|web');
}

let app = apps[argv['start']];
if (!app) {
    printUsage();
    process.exit(1);
} else {
    (<Promise<any>>app().bootstrap()).then(() => console.log('success')).catch((err) => {
        console.log(err);
        process.exit(2);
    });
}

