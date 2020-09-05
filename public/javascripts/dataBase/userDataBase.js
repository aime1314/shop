import Datastore from './syncNeDb/sNedb'
import path from 'path';
import {remote} from 'electron';
let rootPath = path.parse(remote.app.getAppPath()).dir;
let dataBasePath = rootPath+path.sep+'IMdbPath';
let userDbFile = dataBasePath+path.sep+"userData.db";
let userDb = new Datastore ({
    autoload: true,
    filename: userDbFile,
});
userDb.addIndex({
 fieldName: 'id', unique: true
});
export default userDb;