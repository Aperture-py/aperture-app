import EmberObject from '@ember/object';

const ImageOverrides = EmberObject.extend({
  overrides: [],
  find(imgOverride) {
    return this.get('overrides').findBy('id', imgOverride.get('id'));
  },
  findByImage(image) {
    return this.get('overrides').findBy('id', image.get('id'));
  },
  remove(imgOverride) {
    return this.get('overrides').removeObject(imgOverride);
  },
  add(imgOverride) {
    this.get('overrides').pushObject(imgOverride);
  },
  update(imgOverride) {
    const ovr = this.find(imgOverride);
    if (!ovr) {
      this.add(imgOverride);
    } else {
      // lazily update by removing the old one, and adding the new one
      this.remove(ovr);
      this.add(imgOverride);
    }
  },
  empty() {
    this.get('overrides').clear();
  }
});

export default ImageOverrides;
