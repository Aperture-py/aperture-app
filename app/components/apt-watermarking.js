import Component from '@ember/component';
import { inject as service } from '@ember/service';
export default Component.extend({
  us: service('upload'),
  fq: service('file-queue'),
  image: null,
  init() {
    this._super(...arguments);
    const watermark = this.get('fq')
      .find('watermarks')
      .get('files.firstObject');
    if (watermark) {
      this.set('image', watermark);
    }
  },
  actions: {
    watermarkAdded(file) {
      console.log('watermark image added: ', file);

      if (
        this.get('fq')
          .find('watermarks')
          .get('files.length') == 1
      ) {
        this.set('image', file);
      } else {
        // Only supporting 1 watermark image for now.
        // Need to remove additional image from queue.
        this.removeWatermarkFromQueue(file);
      }
    },
    removeWatermark(image) {
      this.removeWatermarkFromQueue(image);
      this.set('image', null);
    }
  },
  removeWatermarkFromQueue(image) {
    this.get('fq')
      .find('watermarks')
      .remove(image);

    console.log(
      'watermark queue after remove: ',
      this.get('fq').find('watermarks')
    );
  }
});
