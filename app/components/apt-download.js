import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { validator, buildValidations } from 'ember-cp-validations';
import $ from 'jquery';
import DownloadManager from '../classes/DownloadManager';

const Validations = buildValidations({
  zipName: [
    validator('presence', {
      presence: true,
      description: 'Zip File Name'
    }),
    validator('length', {
      min: 1,
      max: 50,
      description: 'Zip File Name'
    })
  ]
});

export default Component.extend(Validations, {
  us: service('upload'),
  ts: service('toast'),
  dm: null,
  zipName: null,
  zipResFolders: true,
  showDetailedResults: false,
  progress: computed('us.uploadProgress', 'us.uploadComplete', function() {
    if (this.get('us.uploadProgress') == 100 || this.get('us.uploadComplete')) {
      $('#apt-upload-progress')
        .delay(1000)
        .fadeOut(500, function() {
          $('#apt-post-upload').fadeIn(500);
        });
    }
    return htmlSafe('width: ' + this.get('us.uploadProgress') + '%');
  }),
  init() {
    this._super(...arguments);
    this.set('dm', DownloadManager.create());
  },
  willDestroyElement() {
    this.set('showDetailedResults', false);
    this.set('dm', null);
    this._super(...arguments);
  },
  actions: {
    downloadZip() {
      this.validations.validate().then(({ validations }) => {
        //Don't actually need this validity check now that the checks are
        // gone, but I'll leave this here in case we bring those checks back
        if (validations.get('isValid')) {
          this.downloadZip();
        } else {
          this.set('showZipNameError', true);
        }
      });
    },
    saveLocally() {
      this.saveLocally();
    },
    continueWorking() {
      this.sendAction('continueWorking');
    },
    startOver() {
      this.sendAction('startOver');
    },
    showResults() {
      this.toggleProperty('showDetailedResults');
    }
  },
  downloadZip() {
    const name = this.get('zipName');
    const resFolders = this.get('zipResFolders');
    const uploadResults = this.get('us.uploadResults');
    const self = this;
    (async () => {
      try {
        let didDownload = await self
          .get('dm')
          .downloadZip_Desktop(uploadResults, name, resFolders);
        if (didDownload !== false)
          self.get('ts').success('Downloaded zip file.');
      } catch (e) {
        console.error(e);
        self.get('ts').error('Failed to download zip file. Please try again.');
      }
    })();
  },
  saveLocally() {
    const resFolders = this.get('zipResFolders');
    const uploadResults = this.get('us.uploadResults');
    const self = this;
    (async () => {
      try {
        let didSave = await self
          .get('dm')
          .saveImagesLocally(uploadResults, resFolders);
        if (didSave !== false) self.get('ts').success('Saved images.');
      } catch (e) {
        console.error(e);
        self.get('ts').error('Failed to save images. Please try again.');
      }
    })();
  }
});
