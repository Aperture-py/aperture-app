import EmberObject from '@ember/object';
import DownloadPrep from './DownloadPrep';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

//Desktop ---
import require from 'require';
const dialog = require('electron').remote.dialog;
const fs = require('fs');
const path = require('path');

// ----------

const DownloadManager = EmberObject.extend({
  dp: DownloadPrep.create(),
  async downloadZip(uploadResults, name, useResFolders) {
    const f_imgs = this.get('dp').prepImagesForDownload(
      uploadResults,
      useResFolders
    );
    const resFolders = f_imgs.resFolders;
    const base = f_imgs.base;
    const zip = new JSZip();
    for (const folder in resFolders) {
      const images = resFolders[folder];
      const zipResFolder = zip.folder(folder);
      for (const dl of images) {
        zipResFolder.file(dl.name, dl.b64, { base64: true });
      }
    }
    for (const dl of base) {
      zip.file(dl.name, dl.b64, { base64: true });
    }
    try {
      let blob = await zip.generateAsync({
        type: 'blob',
        compression: 'STORE' // no compression
      });
      const i = name.lastIndexOf('.zip');
      if (i !== -1) {
        name = name.slice(0, i);
      }
      name += '.zip';
      FileSaver.saveAs(blob, name);
    } catch (e) {
      throw e;
    }
  },
  async downloadZip_Desktop(uploadResults, name, useResFolders) {
    const f_imgs = this.get('dp').prepImagesForDownload(
      uploadResults,
      useResFolders
    );

    const resFolders = f_imgs.resFolders;

    const zip = new JSZip();
    for (const folder in resFolders) {
      const images = resFolders[folder];
      const zipResFolder = zip.folder(folder);
      for (const dl of images) {
        zipResFolder.file(dl.name, dl.b64, { base64: true });
      }
    }
    for (const dl of f_imgs.base) {
      zip.file(dl.name, dl.b64, { base64: true });
    }

    let p = new Promise((resolve, reject) => {
      dialog.showSaveDialog(
        {
          title: 'Select Zip Download Location',
          defaultPath: '~/' + name + '.zip',
          extensions: ['zip']
        },
        (saveLoc) => {
          resolve(saveLoc);
          if (saveLoc !== undefined) {
            // make sure filename ends in .zip
            if (saveLoc.lastIndexOf('.zip') == -1) {
              saveLoc += '.zip';
            }
          }
        }
      );
    });

    let saveLoc;

    try {
      saveLoc = await p;
    } catch (e) {
      throw e;
    }

    if (saveLoc === undefined) return false; // use closed dialog (cancelled the save)

    let p2 = new Promise((resolve, reject) => {
      zip
        .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(fs.createWriteStream(saveLoc))
        .on('finish', function() {
          // JSZip generates a readable stream with a "end" event,
          // but is piped here in a writable stream which emits a "finish" event.
          resolve();
        })
        .on('error', function() {
          reject();
        });
    });
    try {
      await p2;
    } catch (e) {
      throw e;
    }
  },
  async saveImagesLocally(uploadResults, useResFolders) {
    let p = new Promise((resolve, reject) => {
      dialog.showOpenDialog(
        {
          title: 'Select Root Download Location',
          defaultPath: '~/',
          properties: ['openDirectory']
        },
        (saveLoc) => {
          resolve(saveLoc);
        }
      );
    });

    let saveLoc;

    try {
      saveLoc = await p;
    } catch (e) {
      throw e;
    }

    if (saveLoc === undefined || saveLoc.length < 1) return false; // user closed dialogue

    //For directory picker, saveLoc is array of length 0. Grab first elem.
    saveLoc = saveLoc[0];
    const f_imgs = this.get('dp').prepImagesForDownload(
      uploadResults,
      useResFolders
    );

    let promises_make_res_folders = [];
    let promises_resized_images = [];
    let promises_base = [];

    for (const folder in f_imgs.resFolders) {
      let p = new Promise((resolve, reject) => {
        fs.mkdir(path.join(saveLoc, folder), (err) => {
          if (err) reject();
          else resolve();
        });
      });
      promises_make_res_folders.push(p);
    }

    try {
      await Promise.all(promises_make_res_folders);
    } catch (e) {
      throw e;
    }

    for (const folder in f_imgs.resFolders) {
      const images = f_imgs.resFolders[folder];
      for (const dl of images) {
        let p = new Promise((resolve, reject) => {
          fs.writeFile(
            path.join(saveLoc, folder, dl.name),
            dl.b64,
            { encoding: 'base64' },
            (err) => {
              if (err) reject();
              else resolve();
              // if (err) console.log('Error Saving file: %s', dl.name);
            }
          );
        });
        promises_resized_images.push(p);
      }
    }

    try {
      await Promise.all(promises_resized_images);
    } catch (e) {
      throw e;
    }

    for (const dl of f_imgs.base) {
      let p = new Promise((resolve, reject) => {
        fs.writeFile(
          path.join(saveLoc, dl.name),
          dl.b64,
          { encoding: 'base64' },
          (err) => {
            if (err) reject();
            else resolve();
          }
        );
      });
      promises_base.push(p);
    }

    try {
      await Promise.all(promises_base);
    } catch (e) {
      throw e;
    }
  }
});

export default DownloadManager;
