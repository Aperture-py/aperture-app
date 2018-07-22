import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default Route.extend({
  fq: service('file-queue'),
  setupController(controller) {
    /**
     * Create the queues ahead of time, otherwise they would  be undefined in
     * components that access them and render before the dropzones, as the
     * dropzones wouldn't have added their queues to the service. Doing this
     * also allows for us to remove the queue yields from the dropzone components.
     */
    this.createQueues();
    controller.set('images', this.get('fq').find('images'));
  },
  createQueues() {
    this.get('fq').create('images');
    this.get('fq').create('watermarks');
  }
});
