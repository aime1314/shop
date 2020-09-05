import Datastore from './syncNeDb/sNedb'
import path from 'path';
import fs from 'fs'
import {remote} from 'electron';
let rootPath = path.parse(remote.app.getAppPath()).dir;
let dataBasePath = rootPath+path.sep+'IMdbPath';
let groupDbFile = dataBasePath+path.sep+"groupData.db";
fs.open(groupDbFile, 'wx', (err, fd) => {
    if (err) {
        if (err.code === 'EEXIST') {
            console.log('通讯数据 已存在');
        }
    }else{
        console.log('通讯数据 初始化 ');
        fs.closeSync(fd)
    }
});
let groupDb = new Datastore ({
    autoload: true,
    filename: groupDbFile,
});
//给来个索引
groupDb.addIndex({
    fieldName: 'id', unique: true
})
export default groupDb;