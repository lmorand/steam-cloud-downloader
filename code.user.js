// ==UserScript==
// @name        Steam Cloud Downloader
// @namespace   https://github.com/lmorand
// @match       https://store.steampowered.com/account/remotestorageapp/
// @grant       none
// @version     1.0
// @author      lmorand
// @description Adds a button to download Steam Cloud save files as a zip file.
// @require     https://raw.githubusercontent.com/Stuk/jszip/v3.10.1/dist/jszip.min.js
// @inject-into content
// @homepageURL https://github.com/lmorand/steam-cloud-downloader
// @supportURL  https://github.com/lmorand/steam-cloud-downloader/issues
// @downloadURL https://raw.githubusercontent.com/lmorand/steam-cloud-downloader/main/code.user.js
// @updateURL   https://raw.githubusercontent.com/lmorand/steam-cloud-downloader/main/code.user.js
// ==/UserScript==

var link = document.createElement("a");
link.href = "#";
link.innerText = "ZIP";

var header = document.querySelector(".accountTable > thead > tr");
header.appendChild(document.createElement("th")).appendChild(link);

var rows = Array.from(document.querySelector(".accountTable > tbody").children);

var name = document.querySelector("#main_content > h2").innerText;

var zip = new JSZip();

function request(row) {
  return new Promise(function(resolve) {
    let httpRequest = new XMLHttpRequest();
    httpRequest.open("GET", row.querySelector("td > a").href);
    httpRequest.responseType = "arraybuffer";
    httpRequest.onload = function() {
      let foldername = row.children[0].innerText;
      let filename = foldername + (foldername? "/":"") + row.children[1].innerText;
      zip.file(filename, this.response);
      resolve();
    }
    httpRequest.send();
  });
}

Promise.all(rows.map(function(row) {
    return request(row);
  }))
  .then(function() {
    zip.generateAsync({
        type: "blob"
    })
    .then(function(content) {
      link.download = name + "_" + new Date().getTime();
      link.href = URL.createObjectURL(content);
    });
  })