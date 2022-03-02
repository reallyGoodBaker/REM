const path = require('path');
const fs = require('fs');

const ServicesPath = path.resolve(__dirname, './services.json');

if (!fs.existsSync(ServicesPath)) {
    fs.writeFileSync(ServicesPath, '{}');
}

function getServices() {
    return JSON.parse(fs.readFileSync(ServicesPath))
}

function writeServices(data) {
    fs.writeFileSync(ServicesPath, JSON.stringify(data));
}

function addComponent(config, path) {
    let id = config.id, comment, auth, ver;

    if (typeof config === 'string') {
        id = config;
    }

    if (!id || !path) return false;
    auth = config.auth || '未知';
    comment = config.comment || '';
    ver = config.ver || '1.0.0';

    let services = getServices();
    if (services[id] && ver < services[id].ver) return null;

    services[id] = {id, comment, auth, ver, path}

    
    writeServices(services);
}


function removeComponent(id) {
    let services = getServices();

    if (services[id]) delete services[id];

    writeServices(services);
}

function register(id, serviceHandler, ...args) {
    let component = getServices()[id];
    if (!component) return;

    let exportClass = require(component.path);
    let service = new exportClass(id, ...args);

    serviceHandler.call(Object.create(null), service);
}


module.exports = {addComponent, removeComponent, register}