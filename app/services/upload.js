import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { task, all } from 'ember-concurrency';
import { isEqual } from '@ember/utils';
import ENV from '../config/environment';
import ImageOverrideCollection from '../classes/ImageOverrideCollection';

export default Service.extend({
  fq: service('file-queue'),
  rs: service('resolutions'),
  ajax: service('ajax'),
  options: null,
  uploadProgress: 0,
  completedImages: 0,
  numImages: 0,
  uploadComplete: false,
  uploadResults: null,
  watermarkText: null,
  _imageOverrides: ImageOverrideCollection.create(),
  clearOverrides() {
    this.get('_imageOverrides').empty();
  },
  updateOptions(options) {
    this.set('options', options);
  },
  updateImageOverride(imgOverride) {
    this.get('_imageOverrides').update(imgOverride);
  },
  getImageOverride(image) {
    return this.get('_imageOverrides').findByImage(image);
  },
  async uploadImages() {
    await this.get('_uploadImages').perform();
  },
  clearPreviousUpload() {
    this.set('uploadProgress', 0);
    this.set('completedImages', 0);
    this.set('numImages', 0);
    this.set('uploadComplete', false);
    this.set('uploadResults', null);
  },
  clearAll() {
    this.clearPreviousUpload();
    this.set('options', null);
    this.set('watermarkText', null);
    this.clearOverrides();
  },
  _uploadImages: task(function*() {
    const iq = this.get('fq').find('images');
    const images = iq.get('files');
    this.set('numImages', images.get('length'));
    const resolutions = this.get('rs').get('resolutions');
    const watermark = this.get('fq')
      .find('watermarks')
      .get('files.firstObject');
    const watermarkText = this.get('watermarkText');
    const options = this.get('options');

    let childTasks = [];

    for (const image of images) {
      let form = new FormData();
      form.append('image', image.get('blob'), image.get('name'));
      const ovr = this.get('_imageOverrides').findByImage(image);
      let quality = options.get('quality');
      if (ovr) {
        if (ovr.get('quality')) {
          quality = ovr.get('quality');
        } else quality = '0';

        form.append('quality', quality);
        if (ovr.get('resolutions')) {
          let exclusions = ovr.get('resolutions.exclusions');
          let inclusions = ovr.get('resolutions.inclusions');
          let resFilteredExclusions = resolutions.filter((res) => {
            for (const ex of exclusions) {
              if (isEqual(ex, res)) {
                return false;
              }
            }
            return true;
          });
          resFilteredExclusions = resFilteredExclusions.concat(inclusions);
          if (resFilteredExclusions.get('length')) {
            let resMapped = resFilteredExclusions.map(
              this._mapResolutionForUpload
            );
            form.append('resolutions', resMapped);
          }
        }
        if (ovr.get('useWatermark')) {
          if (watermark) {
            form.append(
              'watermark',
              watermark.get('blob'),
              watermark.get('name')
            );
          }
          if (watermarkText) form.append('watermarkText', watermarkText);
        }
      } else {
        form.append('quality', quality);
        if (resolutions.get('length')) {
          let resMapped = resolutions.map(this._mapResolutionForUpload);
          form.append('resolutions', resMapped);
        }
        if (watermark) {
          form.append(
            'watermark',
            watermark.get('blob'),
            watermark.get('name')
          );
        }
        if (watermarkText) form.append('watermarkText', watermarkText);
      }

      childTasks.push(
        this.get('_doUpload').perform(
          form,
          image.get('name'),
          image.get('type')
        )
      );
    }
    let results = yield all(childTasks);
    this.set('uploadResults', results);
    this.set('uploadComplete', true);
  }).restartable(),
  _mapResolutionForUpload(res) {
    return res.get('width').toString() + 'x' + res.get('height').toString();
  },
  _doUpload: task(function*(form, name, type) {
    let resp = yield this._uploadForm(form);
    this.set('completedImages', this.get('completedImages') + 1);
    this.set(
      'uploadProgress',
      this.get('completedImages') / this.get('numImages') * 100
    );
    return { response: resp, name: name, type: type };
  })
    .maxConcurrency(10)
    .enqueue(),
  _uploadForm(form) {
    return this.get('ajax').request(ENV.APP.API_URL + '/aperture', {
      method: 'POST',
      data: form,
      processData: false,
      contentType: false
    });
  }
});
