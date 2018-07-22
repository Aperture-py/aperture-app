import Ember from 'ember';
import EmberObject from '@ember/object';

// Resolution *Ember* Class
const Resolution = EmberObject.extend(Ember.Copyable, {
  width: null,
  height: null,
  clear() {
    this.set('width', null);
    this.set('height', null);
  },
  copy() {
    // Override copy method so resolution objects are copyable
    return this.constructor.create({
      width: this.get('width'),
      height: this.get('height')
    });
  },
  isEqual(res) {
    const isEx =
      this.get('height') === res.get('height') &&
      this.get('width') === res.get('width');
    return isEx;
  }
});

export default Resolution;
