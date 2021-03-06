This addon is unreleased, I'm publishing it for discussion and comment only. Feel free to use it, but you get to support it yourself for the present.

ember-computed-cleanup
==============================================================================

Computed properties with cleanup.

Installation
------------------------------------------------------------------------------

```
ember install ember-computed-cleanup
```


Usage
------------------------------------------------------------------------------

Works just like regular `computed`, but you get an extra argument. You pass a
cleanup handler to that argument:

```js
import { computed } from 'ember-computed-cleanup';
export default Component.extend({
  greeting: computed('name', function(key, cleanup) {
    let name = this.name;
    subscribeToSomethingFor(name);
    cleanup(() => unsubscribeFor(name));
    return `Hello ${name}!`;
  })
});
```

Each time your computed property runs and you call `cleanup`, the previous hook
that you passed to `cleanup` runs. And when the whole component is destroyed,
any pending cleanup hook runs.

You're not obligated to call `cleanup` every time. You can leave the previous
cleanup handler in place through all your invalidatations, until it finally runs
at object destruction. Here's an example of a standalone computed macro that keeps a `setInterval` running for the lifetime of the owning Object:

```js
import { computed } from 'ember-computed-cleanup';
const subscriptions = new WeakMap();

export function liveClock() {
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
```

That you can use like:

```js
import Component from '@ember/component';
import { liveClock } from './live-clock';

export default Component.extend({
  now: liveClock()
});
```

Advanced Usage
------------------------------------------------------------------------------

Libraries like ember-concurrency that create their own DSL on top of Ember's computed properties may want to use

```js
import ComputedProperty from '@ember/object/computed';
```

instead of the more typical

```js
import { computed } from '@ember/object';
```

For that case, we provide a `withCleanup` helper instead:

```js
import ComputedProperty from '@ember/object/computed';
import { withCleanup } from 'ember-computed-cleanup';
function makeFancyCP() {
  return new ComputedProperty(withCleanup(function(key, cleanup) {
  });
}
```

Contributing
------------------------------------------------------------------------------

### Installation

* `git clone <repository-url>`
* `cd ember-computed-cleanup`
* `yarn install`

### Linting

* `yarn lint:hbs`
* `yarn lint:js`
* `yarn lint:js --fix`

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
