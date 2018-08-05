import EmberObject from '@ember/object';
import DownloadPrep from './DownloadPrep';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

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
  }
});

export default DownloadManager;
