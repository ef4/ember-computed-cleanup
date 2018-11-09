import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Component from '@ember/component';
import { withCleanup } from 'ember-computed-cleanup';
import ComputedProperty from '@ember/object/computed';

module('Integration | Helper | withCleanup', function(hooks) {
  setupRenderingTest(hooks);

  let actionLog;
  hooks.beforeEach(function() {
    actionLog = [];

    let greeting = new ComputedProperty(withCleanup(function(key, cleanup) {
      let name = this.name;

      cleanup(() => actionLog.push(`unsubscribe ${name}`));
      actionLog.push(`subscribe ${name}`);

      return `Hello ${name}`;
    }));

    this.owner.register('component:greet', Component.extend({
      layout: hbs`{{greeting}}`,
      greeting
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

});
