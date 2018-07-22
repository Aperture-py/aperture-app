import Service from '@ember/service';

export default Service.extend({
  resolutions: null,

  init() {
    this._super(...arguments);
    this.set('resolutions', []);
  },

  add(res) {
    this.get('resolutions').pushObject(res);
  },

  remove(res) {
    this.get('resolutions').removeObject(res);
  },

  removeIndex(index) {
    this.get('resolutions').removeAt(index);
  },

  empty() {
    this.get('resolutions').clear();
  }
});
