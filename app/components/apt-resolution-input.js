import Component from '@ember/component';
import { validator, buildValidations } from 'ember-cp-validations';
import { isEqual } from '@ember/utils';
import Resolution from '../classes/Resolution';

const resValidators = (desc) => {
  return [
    validator('presence', {
      presence: true,
      description: desc
    }),
    validator('number', {
      allowString: true,
      integer: true,
      gt: 0,
      lte: 99999,
      description: desc
    })
  ];
};

const Validations = buildValidations({
  'resToAdd.width': resValidators('Width'),
  'resToAdd.height': resValidators('Height')
});

export default Component.extend(Validations, {
  adding: false,
  resToAdd: null,
  onstartadd: null,
  onendadd: null,
  actions: {
    addResolution() {
      this.hideValidationErrors();
      this.set('resToAdd', Resolution.create());
      this.set('adding', true);
    },
    cancelAdd() {
      this.hideValidationErrors();
      this.set('resToAdd', null);
      this.set('adding', false);
    },
    saveResolution() {
      this.validations.validate().then(({ validations }) => {
        if (validations.get('isValid')) {
          const res = this.get('resToAdd').copy();
          for (const r of this.get('resolutions')) {
            if (isEqual(r, res)) {
              this.set('showDupError', true);
              return;
            }
          }
          this.get('resToAdd').clear();
          this.set('adding', false);
          this.sendAction('saveResolution', res);
        } else {
          const errors = validations.get('errors');
          for (let e of errors) {
            if (e.get('attribute') === 'resToAdd.width') {
              this.set('showWidthError', true);
            } else if (e.get('attribute') === 'resToAdd.height') {
              this.set('showHeightError', true);
            }
          }
        }
      });
    }
  },
  /**
   * Inputs will show error message when you go to add a new resolutions
   * because they will be empty, so toggle the mutuable so that message
   * is hidden upon clicking 'Add'. Messages will be re-shown once input
   * is focused and the validaton re-toggles these properties.
   */
  hideValidationErrors() {
    this.set('showHeightError', false);
    this.set('showWidthError', false);
    this.set('showDupError', false);
  }
});
