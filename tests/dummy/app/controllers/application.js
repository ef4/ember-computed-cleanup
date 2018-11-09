import Controller from '@ember/controller';

export default Controller.extend({
  showClock: true,
  toggleClock() {
    this.set('showClock', !this.showClock);
  }
});
