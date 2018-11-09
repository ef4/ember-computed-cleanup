import Component from '@ember/component';
import { computed } from 'ember-computed-cleanup';

const subscriptions = new WeakMap();

function liveClock() {
  return computed(function(propertyName, cleanup) {
    if (!subscriptions.has(this)) {
      subscriptions.set(this, setInterval(() => {
        this.notifyPropertyChange(propertyName);
      }, 100));
      cleanup(() => clearInterval(subscriptions.get(this)));
    }
    return new Date();
  });
}

export default Component.extend({
  now: liveClock()
});
