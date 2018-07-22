import Component from '@ember/component';
import { inject as service } from '@ember/service';
export default Component.extend({
  us: service('upload'),
  fq: service('file-queue'),
  image: null,
  actions: {
    watermarkAdded(file) {
      if (this.get('image') === null) {
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
  }
});
