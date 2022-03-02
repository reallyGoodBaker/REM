const {addComponent, register} = require('./registry');
const path = require('path');

let list = [];
function add(id) {
    addComponent(id, path.resolve(__dirname, `./${id}.js`));
    list.push(id);
}


module.exports = function(win) {

    add('FilePicker');
    add('MediaSession');

    register('fp', fp => {
        fp.onSelected(paths => {
            console.log(paths);
        });
    }, win);

}