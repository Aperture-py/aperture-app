import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { validator, buildValidations } from 'ember-cp-validations';
import EmberObject from '@ember/object';
const Validations = buildValidations({
  quality: [
    validator('presence', {
      presence: true,
      description: 'Quality'
    }),
    validator('number', {
      allowString: true,
      integer: true,
      gte: 1,
      lte: 95,
      description: 'Quality'
    })
  ]
});
export default Component.extend(Validations, {
  fq: service('file-queue'),
  us: service('upload'),
  ts: service('toast'),
  quality: null,
  maxQueueSize: 52428800, // 50MB
  didInsertElement() {
    this._super(...arguments);
    const opts = this.get('us.options');
    if (opts) {
      this.set('quality', opts.get('quality'));
    }
  },
  willDestroyElement() {
    this.get('us').updateOptions(
      EmberObject.create({ quality: this.get('quality') })
    );
    this._super(...arguments);
  },
  actions: {
    removeImage(image) {
      this.get('fq')
        .find('images')
        .remove(image);
    },
    imageSelected(image) {
      this.sendAction('imageSelected', image);
    },
    uploadImages() {
      this.validations.validate().then(({ validations }) => {
        if (validations.get('isValid')) {
          const imgs = this.get('fq').find('images');
          const num_imgs = imgs.get('files.length');
          const q_size = imgs.get('size');
          if (num_imgs > 0) {
            if (q_size > this.get('maxQueueSize')) {
              this.get('ts').warning(
                'You can only have 50 MBs worth of images. Please remove extra images before attempting upload.'
              );
            } else {
              this.uploadImages(
                EmberObject.create({ quality: this.get('quality') })
              );
            }
          }
        } else {
          this.set('showQualityError', true);
        }
      });
    }
  },
  uploadImages(options) {
    this.sendAction('uploadingImages', true);
    this.get('us').updateOptions(options);
    const self = this;
    (async () => {
      try {
        await self.get('us').uploadImages();
      } catch (e) {
        self.sendAction('uploadingImages', false);
        this.get('ts').error('Failed to upload images. Please try again.');
      }
    })();
  }
});
