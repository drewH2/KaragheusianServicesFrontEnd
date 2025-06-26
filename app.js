const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const globalShortcut = electron.globalShortcut;
const path = require("path");
const url = require("url");
const XLSX = require('xlsx');
const ipc = electron.ipcMain;
const dialog = electron.dialog;
const Menu = electron.Menu
const MenuItem = electron.MenuItem

const fs = require("fs");





const iconUrl = url.format({
    pathname: path.join(__dirname, 'KA.png'),
    protocol: 'file:',
    slashes: true
})
function createWindow() {
    win = new BrowserWindow({
        width: 1920,
        height: 1080,
        icon: 'KA.png',
        resizable: true,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,  // ? Renderer stays secure
            nodeIntegrationInWorker: true,  // ? Allows preload script to use Node.js modules
            sandbox: false  // ? Prevents sandboxing, allowing preload to load modules


        },



    });
    win.maximize();


    win.loadURL(url.format({
        pathname: path.join(__dirname, 'FNG.ico'),
        protocol: 'file:',
        slashes: true
    }));
    /* win.on('resize', () => {
         // Handle window resizing here
 
     })*/
    // Update your UI components based on the new dimensions

    /* win.loadURL(url.format({
         pathname: path.join(__dirname, 'index.html'),
         protocol: 'file',
         slashes: true
     }));*/
    win.loadURL("http://192.168.40.38:3050/getLogin")

    //  globalShortcut.register('Control+F', () => {
    //      win.webContents.send('find-triggered');

    //   });
    win.on('focus', () => {
        globalShortcut.register('Control+F', () => {
            win.webContents.send('find-triggered');
        });
    });

    // Unregister shortcut when window loses focus
    win.on('blur', () => {
        globalShortcut.unregister('Control+F');
    });
    //  win.webContents.openDevTools();
    win.on('closed', () => {
        win = null;
    })


}
function showExportMessage() {
    const options = {
        type: 'info',
        buttons: ['OK'],
        title: 'Information',
        message: 'Successful',
        detail: 'Added Successfully'
    };

    dialog.showMessageBox(null, options, (response) => {
        if (response === 0) {
            console.log('User clicked OK');
        }
    });

};

function messageBox(event, message, detail,confirmRoute) {
   
    const options = {
        type: 'info',
        buttons: ['YES', 'NO'], // 'YES' is at index 0, 'NO' is at index 1
        title: 'Information',
        message: message,
        detail: detail,
    };

    // Use the promise-based version of showMessageBox
    dialog.showMessageBox(null, options).then((result) => {
        if (result.response === 0) { // User clicked 'YES'
            console.log('User confirmed deletion');
            event.sender.send(confirmRoute); // Send a message when confirmed
        } else { // User clicked 'NO'
            console.log('User canceled deletion');
            // event.sender.send('canceled'); // Optionally, you can send a message for cancellation
        }
    }).catch((err) => {
        console.error('Error showing the message box:', err);
    });
}

function showConfMessage(message, detail) {
    const options = {
        type: 'info',
        buttons: ['OK'],
        title: 'Information',
        message: message,
        detail: detail
    };

    dialog.showMessageBox(null, options, (response) => {
        if (response === 0) {
            console.log('User clicked OK');
        }
    });

};

function ErrorBox(titleError, stringError) {

    dialog.showErrorBox(titleError, stringError);

};

ipc.on('showConfmessageBox', function (event, title, desc, confirmRoute) {
console.log('confirmRoute',confirmRoute)
    console.log('title',title)
    console.log('desc',desc)    
    console.log('event',event)
    messageBox(event, title, desc, confirmRoute);


});

ipc.on('messageBox', function (event,message, desc) {


    showConfMessage(message,desc)

})

ipc.on('errorBox', function (event, title, errorDesc) {


    ErrorBox(title, errorDesc);

});
ipc.on('export-window', function (event, data) {

    try {


        for (const result of data) {

            const newDate = new Date(result.serviceDate);
            result.serviceDate = newDate;
           

        }
        for (const result of data) {
            const newDate = new Date(result.receipt_date);
            result.receipt_date = newDate;
        }
     //   const processedResults = processResults(data);
        // Create a worksheet
        const todayDate = new Date();
        const todayFormat = formatDate(todayDate)
        const ws = XLSX.utils.json_to_sheet(data);

        // Create a workbook with the worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

        // Export the workbook to a file
        dialog.showSaveDialog({
            defaultPath: `exported_services-${todayFormat}.xlsx`, // Default file name
            filters: [
                { name: 'Excel Files', extensions: ['xlsx'] }, // Filter to show only Excel files
            ],
        }).then((result) => {
            if (!result.canceled) {
                const filePath = result.filePath;

                // Write the workbook to the specified file path
                XLSX.writeFile(wb, filePath);

                showExportMessage();
            }
        }).catch((error) => {
            console.error(error);
            dialog.showErrorBox('Error', 'Error Exporting Data');
        });


    } catch (error) {
        console.error(error);
        dialog.showErrorBox('Error', 'Error Exporting Data');


    }

});
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with leading zero if needed
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-indexed, hence +1) and pad with leading zero
    const year = date.getFullYear(); // Get full year

    return `${year}-${month}-${day}`; // Return the formatted date
}

app.on('ready', function () {
    createWindow();

   /* win.webContents.on('did-finish-load', () => {
        // mainWindow is accessible here
        win.webContents.setZoomLevel(0);

        // Zoom in
        const zoomIn = () => {
            const currentZoomLevel = win.webContents.getZoomLevel();
            win.webContents.setZoomLevel(currentZoomLevel + 1);
        };

        // Zoom out
        const zoomOut = () => {
            const currentZoomLevel = win.webContents.getZoomLevel();
            win.webContents.setZoomLevel(currentZoomLevel - 1);
        };
        const actualSize = () => {
            win.webContents.setZoomLevel(0);
        };
        const template = [
            {
                label: 'File',
                submenu: [
                    { label: 'Exit', role: 'quit' },
                ],
            },
            {
                label: 'Edit',
                submenu: [
                    { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                    { label: 'Redo', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
                    { type: 'separator' },
                    { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                    { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                    { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
                    { label: 'Delete', role: 'delete' },
                    { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectall' },
                ],
            },
            {
                label: 'View',
                submenu: [
                    { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => win.reload() },
                    { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', click: () => win.webContents.reloadIgnoringCache() },
                    { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', click: actualSize },
                    { label: 'Zoom In', accelerator: 'CmdOrCtrl+=', click: zoomIn },
                    { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: zoomOut },
                    { label: 'Toggle Full Screen', role: 'togglefullscreen' },


                ],


            },
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'Learn More',
                        click: () => {
                            dialog.showSaveDialog(win, {
                                defaultPath: 'Karagheusian Association-PULSE.pdf',
                                filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
                            })
                                .then((result) => {
                                    if (!result.canceled) {
                                        const filePath = result.filePath;
                                        const existingPDFPath = path.join(__dirname, 'Karagheusian Association-PULSE.pdf'); // Replace with your actual PDF file path
                                        fs.copyFileSync(existingPDFPath, filePath);

                                    }
                                })
                                .catch((error) => {
                                    console.error('Error:', error);
                                    ErrorBox('Failed', 'Failed to Save PDF')
                                });
                        },
                    },
                ],
            },


        ];

        const AppMenu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(AppMenu)









    });*/



});


