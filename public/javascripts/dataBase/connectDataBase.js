import Datastore from './syncNeDb/sNedb'
import path from 'path';
import {remote} from 'electron';
let rootPath = path.parse(remote.app.getAppPath()).dir;
let dataBasePath = rootPath+path.sep+'IMdbPath';
let userDbFile = dataBasePath+path.sep+"connectData.db";
let connectDb = new Datastore ({
    autoload: true,
    filename: userDbFile,
});
//给来个索引
connectDb.addIndex({
    fieldName: 'messageId', unique: true
});
// connectDb.addIndex({
//     fieldName: 'messageId'
// });
export default connectDb;