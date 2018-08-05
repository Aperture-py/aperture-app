import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  rs: service('resolutions'),
  actions: {
    saveResolution(res) {
      this.get('rs').add(res);
    },
    removeResolution(res) {
      this.get('rs').remove(res);
    }
  }
});
