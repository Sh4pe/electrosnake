import {app, BrowserWindow} from 'electron'
import * as path from "path";

let win = null
app.on('ready', () => {
    win = new BrowserWindow()
    win.setBounds({x:100, y:100, width:100, height:100})

    // and load the index.html of the app.
    win.loadFile(path.join(__dirname, "../index.html"));

    // Open the DevTools.
    //win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on("closed", () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      win = null;
    });
})