import Service from '@ember/service';
import { inject as service } from '@ember/service';
import DownloadPrep from '../classes/DownloadPrep';

export default Service.extend({
  us: service('upload'),
  ts: service('toast'),
  dp: DownloadPrep.create(),
  clientId:
    '148012623763-ha4qbigocepchpocg0vmr00amtq8n1u3.apps.googleusercontent.com',
  apiKey: 'AIzaSyCVBznAIzVFZzAludVTF0PLqaiWdutDbeY',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
  scope: 'https://www.googleapis.com/auth/drive',
  appId: 'aperture-210319',
  pickerApiLoaded: false,
  authResponse: null,
  isUploading: false,
  loadPicker() {
    gapi.client.load('drive', 'v3');
    const self = this;
    let current_time = new Date().getTime() / 1000;
    if (
      !(
        this.get('authResponse') &&
        this.get('authResponse').expires_at - current_time > 300
      )
    ) {
      gapi.load('auth', {
        callback: function() {
          self.onAuthApiLoad();
        }
      });
    }
    gapi.load('picker', {
      callback: function() {
        self.onPickerApiLoad();
      }
    });
  },
  onAuthApiLoad() {
    const self = this;
    window.gapi.auth.authorize(
      {
        client_id: this.get('clientId'),
        scope: this.get('scope'),
        immediate: false
      },
      function(x) {
        self.handleAuthResult(x);
      }
    );
  },
  onPickerApiLoad() {
    this.set('pickerApiLoaded', true);
    this.createPicker();
  },
  handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
      this.set('authResponse', authResult);
      this.createPicker();
    }
  },
  createPicker() {
    const self = this;
    if (this.get('pickerApiLoaded') != null && this.get('authResponse')) {
      let docsView = new google.picker.DocsView()
        .setIncludeFolders(true)
        .setMimeTypes('application/vnd.google-apps.folder')
        .setSelectFolderEnabled(true);

      let picker = new google.picker.PickerBuilder()
        .enableFeature(google.picker.Feature.NAV_HIDDEN)
        .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
        .setAppId(this.get('appId'))
        .setOAuthToken(this.get('authResponse').access_token)
        .addView(docsView)
        .setDeveloperKey(this.get('apiKey'))
        .setCallback(function(d) {
          self.pickerCallback(d);
        })
        .build();

      picker.setVisible(true);
    }
  },
  pickerCallback(data) {
    if (data.action == google.picker.Action.PICKED) {
      let folderId = data.docs[0].id;
      this.saveImages(folderId);
      // this.get('us').googleDriveSave(folderId);
    }
  },
  saveImages(folderId) {
    let useResFolders = false;
    const uploadResults = this.get('us.uploadResults');
    let f_imgs = this.get('dp').prepImagesForDownload(
      uploadResults,
      useResFolders
    );

    let promises = [];

    for (const dl of f_imgs.base) {
      let p = this.base64image(
        folderId,
        dl.get('b64'),
        dl.get('name'),
        dl.get('type')
      );
      promises.push(p);
    }

    this.set('isUploading', true);

    Promise.all(promises)
      .then(() => {
        this.get('ts').success('Saved images to your Google Drive.');
      })
      .catch(() => {
        this.get('ts').error(
          'Failed to save images to Google Drive. Please try again.'
        );
      })
      .finally(() => {
        this.set('isUploading', false);
      });
  },
  base64image(folderId, base64, name, mimeType) {
    return new Promise((resolve, reject) => {
      let metadata = {
        title: name,
        mimeType: mimeType,
        parents: [{ id: folderId }]
      };

      const boundary = '-------314159265358979323846';
      const delimiter = '\r\n--' + boundary + '\r\n';
      const close_delim = '\r\n--' + boundary + '--';
      let contentType = mimeType || 'application/octet-stream';
      let multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' +
        contentType +
        '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64 +
        close_delim;

      let request = gapi.client.request({
        path: '/upload/drive/v2/files',
        method: 'POST',
        params: {
          uploadType: 'multipart'
        },
        headers: {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        body: multipartRequestBody
      });

      request.execute(function(resp) {
        if (resp.error) {
          reject();
        } else {
          resolve();
        }
      });
    });
  }
});
