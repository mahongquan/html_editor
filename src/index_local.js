import React from 'react';
import ReactDOM from 'react-dom';
const fs = require('fs');
const path = require('path');
// console.log(path);
function fileExist(p) {
  if (fs.existsSync(p)) {
    return true;
  }
  return false;
}
function link(where, module_name) {
  // body...
  var thelink = document.createElement('link');
  thelink.setAttribute('rel', 'stylesheet');
  var file1 = path.join(where, module_name);
  thelink.setAttribute('href', file1);
  document.head.appendChild(thelink);
}
function getWhere() {
  return window.require('electron').ipcRenderer.sendSync('getpath');
}
let module_name;
let where = getWhere();
let App;
// module_name="./AppTest";
module_name = './App';
if (module_name === './App') {
  link('./', 'animate.min.css');
  link(where,'node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css');
  link(where, 'node_modules/bootstrap/dist/css/bootstrap.min.css');
  link(where, 'node_modules/bootstrap/dist/css/bootstrap-theme.min.css');
}

App = require(module_name).default;
ReactDOM.render(<App />, document.getElementById('root'));
