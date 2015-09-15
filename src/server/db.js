import {MongoClient,ObjectID} from 'mongodb';
import nconf from './wrio_nconf'; 
import {Promise} from 'es6-promise';

let db = {
    db: {},
    ObjectID: ObjectID
} ;
export default db;

export function init() {
    let host = nconf.get('mongo:host');
    let user = nconf.get('mongo:user');
    let password = nconf.get('mongo:password');
    let mongodbname = nconf.get('mongo:dbname');
    
    let url = `mongodb://${user}:${password}@${host}:27017/${mongodbname}`;

    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, database) {
            if (err) {
                return reject(err);  
            }

            db.db = database;
            resolve(db.db);
        });
    });
}

