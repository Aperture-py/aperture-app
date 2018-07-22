import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | image-upload', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:image-upload');
    assert.ok(route);
  });
});
