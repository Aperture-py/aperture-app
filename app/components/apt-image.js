import Component from '@ember/component';
import FileReader from 'ember-file-upload/system/file-reader';
import { inject as service } from '@ember/service';
export default Component.extend({
  ajax: service('ajax'),
  disableRemove: false,
  blobUrl: null,
  init() {
    this._super(...arguments);
    this.renderImageBlob(this.get('image'));
  },
  didUpdateAttrs() {
    this._super(...arguments);
    this.renderImageBlob();
  },
  willDestroyElement() {
    this.set('blobUrl', null);
    this.set('image', null);
    this._super(...arguments);
  },
  actions: {
    removeImage() {
      this.sendAction('removeImage', this.get('image'));
    },
    imageSelected() {
      this.sendAction('imageSelected', this.get('image'));
    }
  },
  renderImageBlob() {
    const image = this.get('image');
    const reader = new FileReader();
    reader.readAsDataURL(image.get('blob')).then((url) => {
      if (!this.isDestroyed) this.set('blobUrl', url);
    });
  }
});
