define([
  "jquery.plugins",
  "common/ObjectUtils",
  "common/constants/index",
  "common/undoManager",
  "widgets/circleDrawer/circleDrawer",

  "hbs!./myWidget",
  "css!./myWidget"
], function($, ObjectUtils, constants, UndoManager, CircleDrawer, template) {
  "use strict";

  /**
   * my widget.
   * @class myWidget
   * @memberof views.myWidget
   */
  var myWidget = $.widget("ux.myWidget", {
    options: {
      className: "ux-widget",
      title: "Unavailable",
      bufferSize: 5
    },

    _create: function() {
      var self = this;

      self.element.addClass(self.options.className);

      self.undoManager = new UndoManager({
        callbackFn: self.updateUI.bind(self),
        bufferSize: 5
      });

      self._render();
      self._bindListener();
      self._super();
    },

    /**
     * The imported template should be used here to create the layout.
     * @private
     */
    _render: function() {
      var self = this;

      // create the dom of this gadget using its template.
      self.element.html(template());

      self.$ctrlLimit = self.element.find("#ctrlLimit");
      self.$btnUndo = self.element.find("#btnUndo");
      self.$btnRedo = self.element.find("#btnRedo");
      self.$btnClear = self.element.find("#btnClear");
      self.$view = self.element.find("#view-container");

      self.circleDrawer = new CircleDrawer(
        {
          undoManager: self.undoManager,
          height: 460
        },
        self.$view
      );

      self.updateUI();
    },

    /**
     * Bind event listener.
     * @private
     */
    _bindListener: function() {
      var self = this;

      self.element.on("click", "#btnUndo", function() {
        self.undoManager.undo();
        self.updateUI();
      });

      self.element.on("click", "#btnRedo", function() {
        self.undoManager.redo();
        self.updateUI();
      });

      self.element.on("click", "#btnClear", function() {
        self.undoManager.clear();
        self.updateUI();
      });

      self.element.on("click", "#btnClearView", function() {
        self.circleDrawer.reset();
        self.undoManager.clear();
        self.updateUI();
      });

      self.element.on("change input", "#ctrlLimit", function(evt) {
        var $target = $(evt.currentTarget),
          limit = parseInt($target.val(), 10);

        if (!isNaN(limit)) {
          self.undoManager.configure({ bufferSize: limit });
        }
        self.updateUI();
      });
    },

    updateUI: function() {
      this.$btnUndo.prop("disabled", !this.undoManager.hasUndo());
      this.$btnRedo.prop("disabled", !this.undoManager.hasRedo());
    }
  });

  return myWidget;
});
