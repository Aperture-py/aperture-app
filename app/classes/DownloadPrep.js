import EmberObject from '@ember/object';
import DownloadImage from './DownloadImage';

const DownloadPrep = EmberObject.extend({
  prepImagesForDownload(uploadResults, useResFolders) {
    let imageNames = {};
    let resFolders = {};
    let base = [];

    let getFinalName = (raw_name, ext, res) => {
      let name = res ? raw_name + '_' + res.join('_') : raw_name;
      if (!(name in imageNames)) {
        imageNames[name] = 1;
      } else {
        let dup = imageNames[name];
        imageNames[name]++;
        name += ' (' + dup + ')';
      }
      return name + '.' + ext;
    };

    let addToResFolder = (res_req, dl) => {
      let res = res_req.join('_');
      if (!(res in resFolders)) {
        resFolders[res] = [dl];
      } else {
        resFolders[res].push(dl);
      }
    };

    for (const result of uploadResults) {
      let name = result.name;
      let mimeType = result.type;

      let ext_split = name.split('.');
      let ext = ext_split[ext_split.length - 1]; // assume extension is the last '.' separator.
      let raw_name = ext_split.slice(0, -1).join('.'); // file name was all but the last '.'
      let resp = result.response;
      if (resp.images) {
        // multiple resolutions exist
        const images = resp.images;
        for (const img of images) {
          let meta = img.meta;
          let resolution = meta.resolution;
          let res_req = resolution.requested;
          let res_actual = resolution.actual;
          let fname = getFinalName(raw_name, ext, res_actual);
          let dl = DownloadImage.create({
            b64: img.image,
            name: fname,
            type: mimeType
          });
          if (useResFolders) {
            addToResFolder(res_req, dl);
          } else {
            base.push(dl);
          }
        }
      } else {
        let image = resp.image;
        let meta = resp.meta;
        if (meta.resolution) {
          // a single resolution exists
          let resolution = meta.resolution;
          let res_actual = resolution.actual;
          let res_req = resolution.requested;
          let fname = getFinalName(raw_name, ext, res_actual);
          let dl = DownloadImage.create({
            b64: image,
            name: fname,
            type: mimeType
          });
          if (useResFolders) {
            addToResFolder(res_req, dl);
          } else {
            base.push(dl);
          }
        } else {
          // no resolution for image, just add to base folder
          let fname = getFinalName(raw_name, ext);
          let dl = DownloadImage.create({
            b64: image,
            name: fname,
            type: mimeType
          });
          base.push(dl);
        }
      }
    }
    return { base: base, resFolders: resFolders };
  }
});

export default DownloadPrep;
