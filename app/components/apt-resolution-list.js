import Component from '@ember/component';

export default Component.extend({
  resolutions: null,
  actions: {
    removeResolution(res) {
      this.sendAction('removeResolution', res);
    }
  }
});
