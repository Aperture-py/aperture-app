import Component from '@ember/component';
import require from 'require';
export default Component.extend({
  actions: {
    helpPage() {
      try {
        const s = require('electron').shell;
        s.openExternal('https://aperture.run/guides');
      } catch (e) {}
    }
  }
});
