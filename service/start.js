const {addComponent, register} = require('./registry');
const path = require('path');
const {dialog, ipcMain} = require('electron');

let list = [];
function add(id) {
    addComponent(id, path.resolve(__dirname, `./${id}.js`));
    list.push(id);
}


module.exports = function(win) {

    add('FilePicker');
    add('MediaSession');

    dialog.showMessageBox(win, {
        title: "Services",
        message: `${list.length} service${list.length>1&&'s'||''} started. \n> ${list.join('\n> ')}`,
        type: 'info'
    });

    register('fp', fp => {
        fp.onSelected(paths => {
            console.log(paths);
        });
    }, win);

}