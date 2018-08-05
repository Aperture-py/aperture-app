import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { validator, buildValidations } from 'ember-cp-validations';
import { isEqual } from '@ember/utils';
import ImageOverride from '../classes/ImageOverride';

const Validations = buildValidations({
  'override.quality': [
    validator('presence', {
      presence: true,
      description: 'Quality'
    }),
    validator('number', {
      allowString: true,
      integer: true,
      gte: 1,
      lte: 95,
      description: 'Quality'
    })
  ]
});
export default Component.extend(Validations, {
  us: service('upload'),
  rs: service('resolutions'),
  ts: service('toast'),
  override: null,
  inclusions: computed('override.resolutions.inclusions.[]', function() {
    return this.get('override.resolutions.inclusions');
  }),
  rsWithExclusions: computed(
    'rs.resolutions.[]',
    'override.resolutions.exclusions.[]',
    function() {
      let exclusions = this.get('override.resolutions.exclusions');
      let rs_res = this.get('rs.resolutions');
      let f_res = rs_res.filter((res) => {
        for (const ex of exclusions) {
          if (isEqual(ex, res)) {
            return false;
          }
        }
        return true;
      });
      return f_res;
    }
  ),
  didReceiveAttrs() {
    this._super(...arguments);
    this.setOverride();
  },
  actions: {
    saveChanges() {
      this.validations.validate().then(({ validations }) => {
        if (validations.get('isValid')) {
          this.saveChanges();
        } else {
          this.set('showQualityError', true); // Only validation is on quality. Show the error.
        }
      });
    },
    addResolutionExclusion(res) {
      this.get('override.resolutions.exclusions').pushObject(res);
    },
    addResolutionInclusion(res) {
      this.get('override.resolutions.inclusions').pushObject(res);
    },
    removeResolutionInclusion(res) {
      this.get('override.resolutions.inclusions').removeObject(res);
    },
    backToUpload() {
      this.sendAction('backToUpload');
    }
  },
  saveChanges() {
    const ovr = this.get('override').copy();
    this.get('us').updateImageOverride(ovr);
    this.get('ts').success('Override saved for: ' + this.get('image.name'));
  },
  setOverride() {
    const ovr = this.get('us').getImageOverride(this.get('image'));
    if (ovr) {
      // Create copy so it can be worked on without affecting reference in service's array
      this.set('override', ovr.copy());
    } else {
      const newOvr = ImageOverride.create({
        id: this.get('image.id'),
        quality: this.get('us.options.quality'),
        resolutions: {
          inclusions: [],
          exclusions: []
        }
      });
      this.set('override', newOvr);
    }
  }
});
