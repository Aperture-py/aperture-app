import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
export default Controller.extend({
  rs: service('resolutions'),
  us: service('upload'),
  fq: service('file-queue'),
  showImageOverride: false,
  selectedImage: null,
  uploading: false,
  didInitialUpload: false,
  actions: {
    initialUpload() {
      this.set('didInitialUpload', true);
    },
    imageSelected(image) {
      if (
        !(
          this.get('selectedImage') &&
          this.get('selectedImage').get('id') === image.get('id')
        )
      ) {
        this.set('selectedImage', image);
        if (!this.get('showImageOverride')) {
          this.set('showImageOverride', true);
        }
      }
    },
    backToUpload() {
      this.set('showImageOverride', false);
      this.set('selectedImage', null);
    },
    uploadingImages(upl) {
      this.set('uploading', upl);
    },
    continueWorking() {
      this.get('us').clearPreviousUpload();
      this.set('uploading', false);
    },
    startOver() {
      this.get('us').clearAll();
      this.get('fq.files').forEach((file) => {
        file.set('queue', null);
      });
      this.get('fq').set('files', A());
      this.get('fq')
        .find('images')
        .set('files', A());
      this.get('fq')
        .find('watermarks')
        .set('files', A());
      this.get('rs').empty();
      this.set('uploading', false);
    }
  }
});
