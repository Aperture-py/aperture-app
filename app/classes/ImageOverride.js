import Ember from 'ember';
import EmberObject from '@ember/object';

const ImageOverride = EmberObject.extend(Ember.Copyable, {
  id: null,
  quality: null,
  resolutions: {
    inclusions: null,
    exclusions: null
  },
  useWatermark: true,
  copy() {
    return this.constructor.create({
      id: this.get('id'),
      quality: this.get('quality'),
      resolutions: this.get('resolutions'),
      useWatermark: this.get('useWatermark')
    });
  }
});

export default ImageOverride;
