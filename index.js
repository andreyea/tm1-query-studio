var electron = require('electron');
var BrowserWindow = electron.BrowserWindow;
var app = electron.app;
var Menu = electron.Menu;
var ipc = electron.ipcMain;
var activeSessions = [];
var http = require('http');
var exportEnabled = true;

app.on('ready', function () {
    var mainWindow = new BrowserWindow({
        show: false
    });

    mainWindow.loadURL('file://' + __dirname + '/app/index.html');

    mainWindow.once('ready-to-show', function () {
        mainWindow.show();
    });

    var template = [

        {
            label: "File",
            submenu: [
                {
                    label: 'Connect to TM1',
                    click: function () {
                        mainWindow.webContents.send('connect');
                    }
                },
                {
                    label: 'Logout from TM1',
                    click: function () {
                        mainWindow.webContents.send('logout');
                    }
                },
                {
                    label: 'Settings',
                    click: function () {
                        mainWindow.webContents.send('settings');
                    }
                },
                {
                    label: 'Exit',
                    click: function () {

                    },
                    role: 'quit'
                }
                /*,
                {
                    label: 'Toggle Developer Tools',
                    accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                    click(item, focusedWindow) {
                        if (focusedWindow) focusedWindow.webContents.toggleDevTools()
                    }
                }*/




            ]
        },
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Slice to Excel',
                    click: function () {
                        mainWindow.webContents.send('tm1Slice');
                    },
                    enabled: exportEnabled
                },
                {
                    label: 'Snapshot to Excel',
                    click: function () {
                        mainWindow.webContents.send('tm1Snapshot');
                    },
                    enabled: exportEnabled
                }

            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'TM1 Objects',
                    click: function () {
                        mainWindow.webContents.send('showNav');
                    },
                    type: 'checkbox', 
                    checked: false
                },
                {
                    label: 'Query Editor',
                    click: function () {
                        mainWindow.webContents.send('editor');
                    },
                    type: 'checkbox', 
                    checked: true
                },
                {
                    label: 'TI Console',
                    click: function () {
                        mainWindow.webContents.send('tiConsole');
                    },
                    type: 'checkbox', 
                    checked: false
                },
                {
                    label: 'Display Control Cubes',
                    click: function () {
                        mainWindow.webContents.send('controlObjects');
                    },
                    type: 'checkbox', 
                    checked: false
                }

            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About TM1 Query Studio',
                    click: function () {
                        mainWindow.webContents.send('about');
                    },
                    role: 'about'
                }
            ]
        }
    ];
    var menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
});

process.on('exit', function () {

    activeSessions.forEach(function (item, index) {

    });
});




ipc.on('auth-login-success', function (a, session) {
    activeSessions.push(session);
    //console.log(activeSessions);
});

ipc.on('auth-logout-success', function (a, session) {
    for (var i = 0; i < activeSessions.length; i++) {
        if (activeSessions[i].HTTPPortNumber === session.HTTPPortNumber) {
            activeSessions.splice(i, 1);
            break;
        }
    }
    //console.log(activeSessions);
});

app.on('certificate-error', function (event, webContents, url, error, cert, callback) {
    if (error) {
        event.preventDefault();
        callback(true);
    } else {
        callback(true);
    }
});
