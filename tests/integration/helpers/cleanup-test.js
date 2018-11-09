import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Component from '@ember/component';
import { computed } from 'ember-computed-cleanup';

module('Integration | Helper | cleanup', function(hooks) {
  setupRenderingTest(hooks);

  let actionLog;
  hooks.beforeEach(function() {
    actionLog = [];

    this.owner.register('component:greet', Component.extend({
      layout: hbs`{{greeting}}`,
      greeting: computed('name', function(key, cleanup) {
        let name = this.name;

        // this example cleans up first
        cleanup(() => actionLog.push(`unsubscribe ${name}`));
        actionLog.push(`subscribe ${name}`);

        return `Hello ${name}`;
      })
    }));

    this.owner.register('component:greet-reverse', Component.extend({
      layout: hbs`{{greeting}}`,
      greeting: computed('name', function(key, cleanup) {
        let name = this.name;

        // this example cleans up second
        actionLog.push(`subscribe ${name}`);
        cleanup(() => actionLog.push(`unsubscribe ${name}`));

        return `Hello ${name}`;
      })
    }));

    this.owner.register('component:long-subscription', Component.extend({
      layout: hbs`{{greeting}}`,
      greeting: computed('name', function(key, cleanup) {
        let name = this.name;

        // this example maintains one long subscription across all invalidations
        if (!this.previousGreeting) {
          actionLog.push(`subscribe ${name}`);
          cleanup(() => actionLog.push(`unsubscribe ${name}`));
        }

        return (this.previousGreeting = `Hello ${name}`);
      })
    }));

  });

  test('subscribes at render', async function(assert) {
    await render(hbs`<Greet @name="Quint" />`);
    assert.deepEqual(actionLog, ["subscribe Quint"]);
    assert.equal(this.element.textContent.trim(), "Hello Quint");
  });

  test('unsubscribes at teardown', async function(assert) {
    this.set('showIt', true);
    await render(hbs`{{#if showIt}}<Greet @name="Quint" />{{/if}}`);
    this.set('showIt', false);
    await settled();
    assert.deepEqual(actionLog, ["subscribe Quint", "unsubscribe Quint"]);
  });

  test('can unsubscribe and resubscribe at invalidation', async function(assert) {
    this.set('showIt', true);
    this.set('name', 'Quint');
    await render(hbs`{{#if showIt}}<Greet @name={{name}} />{{/if}}`);
    this.set('name', 'Arthur');
    await settled();
    assert.equal(this.element.textContent.trim(), "Hello Arthur");
    assert.deepEqual(actionLog, ["subscribe Quint", "unsubscribe Quint", "subscribe Arthur"]);
    this.set('showIt', false);
    await settled();
    assert.deepEqual(actionLog, ["subscribe Quint", "unsubscribe Quint", "subscribe Arthur", "unsubscribe Arthur"]);

  });

  test('can unsubscribe and resubscribe at invalidation, reverse order', async function(assert) {
    this.set('showIt', true);
    this.set('name', 'Quint');
    await render(hbs`{{#if showIt}}<GreetReverse @name={{name}} />{{/if}}`);
    this.set('name', 'Arthur');
    await settled();
    assert.equal(this.element.textContent.trim(), "Hello Arthur");
    assert.deepEqual(actionLog, ["subscribe Quint", "subscribe Arthur", "unsubscribe Quint"]);
    this.set('showIt', false);
    await settled();
    assert.deepEqual(actionLog, ["subscribe Quint", "subscribe Arthur", "unsubscribe Quint", "unsubscribe Arthur"]);
  });

  test('can maintain one long subscription across invalidations', async function(assert) {
    this.set('showIt', true);
    this.set('name', 'Quint');
    await render(hbs`{{#if showIt}}<LongSubscription @name={{name}} />{{/if}}`);
    this.set('name', 'Arthur');
    await settled();
    assert.equal(this.element.textContent.trim(), "Hello Arthur");
    assert.deepEqual(actionLog, ["subscribe Quint"]);
    this.set('showIt', false);
    await settled();
    assert.deepEqual(actionLog, ["subscribe Quint", "unsubscribe Quint"]);
  });



});
