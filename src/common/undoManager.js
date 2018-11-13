define([], function() {
  "use strict";

  function removeFromTo(array, from, to) {
    array.splice(
      from,
      !to ||
        1 +
          to -
          from +
          (!((to < 0) ^ (from >= 0)) && (to < 0 || -1) * array.length)
    );

    return array.length;
  }

  function execute(ctx, command, action) {
    if (!command || typeof command[action] !== "function") {
      return this;
    }

    ctx.isExecuting = true;

    command[action]();

    ctx.isExecuting = false;

    return this;
  }

  /**
   * A simple undo and redo manager.
   * @namespace common.constants
   */
  function UndoManager(options) {
    this.queuedCommands = [];
    this.callbackFn = null;
    this.bufferSize = 1000;
    this.index = -1;
    this.configure(options || {});
    this.isExecuting = false;
  }

  UndoManager.prototype = {
    /**
     * Reset configuration options for this instance of UndoManager.
     * @param {Object} options
     * @param {string} [options.callbackFn] - The callback function to call for processing.
     * @param {number} [options.bufferSize] - How many item we should hold on into.
     * @returns {this}
     */
    configure: function(options) {
      this.callbackFn = options.callbackFn || this.callbackFn;
      this.bufferSize = options.bufferSize || this.bufferSize;

      return this;
    },

    size: function() {
      return this.queuedCommands.length;
    },

    /**
     * Clears the memory, losing all stored states. Reset the index.
     * @returns {this}
     */
    clear: function() {
      var prevSize = this.size(),
        callback = this.callbackFn;

      this.queuedCommands = [];
      this.index = -1;

      if (typeof callback === "function" && prevSize > 0) {
        callback();
      }

      return this;
    },

    /**
     * Appends the given command to the queue.
     * @param {Array} items - Add the following items to the queue.
     * @returns {this}
     */
    queue: function(command) {
      var callback = this.callbackFn,
        queuedCommands = this.queuedCommands,
        bufferSize = this.bufferSize,
        index = this.index;

      if (this.isExecuting) {
        return this;
      }

      // if we are here after having called undo,
      // invalidate items higher on the stack
      queuedCommands.splice(index + 1);

      queuedCommands.push(command);

      // if the number of queued commands exceeds the buffer size,
      // remove items from the start.
      if (queuedCommands.length > bufferSize) {
        removeFromTo(queuedCommands, 0, -(bufferSize + 1));
      }

      // set the current index to the end
      this.index = this.size() - 1;

      if (typeof callback === "function") {
        callback();
      }

      return this;
    },

    /**
     * Perform undo: call the undo function at the current index and decrease the index by 1.
     */
    undo: function() {
      var queuedCommand = this.queuedCommands[this.index],
        callback = this.callbackFn;

      if (!queuedCommand) {
        return this;
      }

      execute(this, queuedCommand, "undo");

      this.index -= 1;

      if (typeof callback === "function") {
        callback();
      }

      return this;
    },

    /**
     * Perform redo: call the redo function at the next index and increase the index by 1.
     */
    redo: function() {
      var queuedCommand = this.queuedCommands[this.index + 1],
        callback = this.callbackFn;

      if (!queuedCommand) {
        return this;
      }

      execute(this, queuedCommand, "redo");

      this.index += 1;

      if (typeof callback === "function") {
        callback();
      }

      return this;
    },

    hasUndo: function() {
      return this.index !== -1;
    },

    hasRedo: function() {
      return this.index < this.queuedCommands.length - 1;
    },

    getCommands: function() {
      return this.queuedCommands;
    },

    getIndex: function() {
      return this.index;
    }
  };

  return UndoManager;
});
