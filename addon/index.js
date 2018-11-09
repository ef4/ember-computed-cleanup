import { computed as originalComputed } from '@ember/object';
const destroyer = '_ember_computed_cleanup_destroyers_';

function examineArgs(args) {
  let dependentKeys = args.slice(0, -1);
  let finalArg = args[args.length - 1];
  let getter, setter;
  if (typeof finalArg === 'function') {
    getter = finalArg;
  } else {
    getter = finalArg.get;
    setter = finalArg.set;
  }
  return { dependentKeys, getter, setter };
}

function wrap(queues, fn) {
  if (!fn) { return; }
  return function(...args) {
    args.push(cleanupFn => {
      let queue = queues.get(this);
      if (!queue) {
        queue = [];
        queues.set(this, queue);
        cleanupOnDestroy(this, () => queue.forEach(fn => fn()));
      }
      while (queue.length > 0) {
        queue.shift()();
      }
      queue.push(cleanupFn);
    });
    return fn.apply(this, args);
  }
}

// based on similar code in ember-concurrency
function cleanupOnDestroy(owner, callback) {
  if (!owner.willDestroy) {
    // we're running on a non-ember object and can't really do cleanup.
    return;
  }
  if (!owner.willDestroy[destroyer]) {
    let oldWillDestroy = owner.willDestroy;
    let disposers = [];
    owner.willDestroy = function() {
      for (let i = 0, l = disposers.length; i < l; i ++) {
        disposers[i]();
      }
      oldWillDestroy.apply(owner, arguments);
    };
    owner.willDestroy[destroyer] = disposers;
  }
  owner.willDestroy[destroyer].push(callback)
}

export function computed(...args) {
  let { dependentKeys, getter, setter } = examineArgs(args);
  let queues = new WeakMap();
  if (setter) {
    return originalComputed(...dependentKeys, {
      get: wrap(queues, getter),
      set: wrap(queues, setter),
    });
  } else {
    return originalComputed(...dependentKeys, wrap(queues, getter));
  }
}


