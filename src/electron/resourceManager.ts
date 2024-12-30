import osUtils from "os-utils"
import fs from 'fs'
import os from 'os'
import { BrowserWindow } from "electron";
import { ipcWebContentSend } from "./util.js";


const POLLING_INTERVAL = 500;
export function pollResources(mainWindow:BrowserWindow){
    setInterval(async ()=>{
        const ramUsage = getRamUsage()
        const cpuUsage = await getCpuUsage();
        const storageUsage = getStorageData()
        ipcWebContentSend("statistic",mainWindow.webContents,{
            cpuUsage,
            ramUsage, 
            storageUsage:storageUsage.usage})        
    },POLLING_INTERVAL)
}

export function getStaticData(){
    const totalStorage = getStorageData().total;
    const cpuModel = os.cpus()[0].model;
    const totalMemoryGB = Math.floor(osUtils.totalmem()/1024);
    return {
        totalStorage,
        cpuModel,
        totalMemoryGB
    }


}
function getCpuUsage():Promise<number>{
    return new Promise((resolve)=>{

        osUtils.cpuUsage(resolve);
    });
}


function getRamUsage(){
    return 1-osUtils.freememPercentage()
}
function getStorageData(){
    const stats = fs.statfsSync(process.platform==='win32'?'c://':'/')
    const total = stats.bsize * stats.blocks
    const free = stats.bsize * stats.bfree
    return {
        total: Math.floor(total/1_000_000_000),
        usage: 1-free/total
    }
}
