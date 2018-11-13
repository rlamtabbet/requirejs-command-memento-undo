define([
  "jquery.plugins",
  "common/idGenerator",
  "hbs!widgets/circleDrawer/circleDrawer",
  "css!widgets/circleDrawer/circleDrawer"
], function($, IDGenerator, template) {
  "use strict";

  var MIN_RADIUS = 10,
    MAX_RADIUS = 40,
    CANVAS_WIDTH = 600,
    CANVAS_HEIGHT = 400,
    circleDrawer;

  /**
   * circleDrawer.
   * @class circleDrawer
   * @memberof widgets.circleDrawer.circleDrawer
   */
  circleDrawer = $.widget("ux.myWidget", {
    options: {
      className: "ux-widget",
      circles: [],
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT
    },

    _create: function() {
      this.element.addClass(this.options.className);

      this.undoManager = this.options.undoManager;
      this.idGenerator = new IDGenerator();

      this._render();
      this._bindListener();
      this._super();
    },

    /**
     * The imported template should be used here to create the layout.
     * @private
     */
    _render: function() {
      var drawingCanvas;

      // create the dom of this gadget using its template.
      this.element.html(template(this.options));

      this.$view = this.element.find("#view");

      this.drawingCanvas = drawingCanvas = this.$view.get(0);

      if (drawingCanvas.getContext === undefined) {
        return;
      }

      this.drawingContext = drawingCanvas.getContext("2d");
    },

    /**
     * Bind event listener.
     * @private
     */
    _bindListener: function() {
      var self = this;

      self.element.on("click", "#view", function(evt) {
        var drawingCanvas = self.drawingCanvas,
          intColor = Math.floor(Math.random() * (256 * 256 * 256)),
          hexColor = parseInt(intColor, 10).toString(16),
          color = "#" + (hexColor.length < 2 ? "0" + hexColor : hexColor),
          radius = MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS),
          mouseX = 0,
          mouseY = 0;

        if (evt.pageX || evt.pageY) {
          mouseX = evt.pageX;
          mouseY = evt.pageY;
        } else if (evt.clientX || evt.clientY) {
          mouseX =
            evt.clientX +
            document.body.scrollLeft +
            document.documentElement.scrollLeft;
          mouseY =
            evt.clientY +
            document.body.scrollTop +
            document.documentElement.scrollTop;
        }

        mouseX -= drawingCanvas.offsetLeft;
        mouseY -= drawingCanvas.offsetTop;

        self.createCircle({
          id: self.idGenerator.generate(),
          x: mouseX,
          y: mouseY,
          radius: radius,
          color: color
        });
      });
    },

    reset: function() {
      this.clear();
      this.option("circles", []);
    },

    clear: function() {
      var width = this.options.width,
        height = this.options.height;

      this.drawingContext.clearRect(0, 0, width, height);
    },

    drawCircle: function(x, y, radius, color) {
      this.drawingContext.fillStyle = color;
      this.drawingContext.beginPath();
      this.drawingContext.arc(x, y, radius, 0, Math.PI * 2, true);
      this.drawingContext.closePath();
      this.drawingContext.fill();
    },

    draw: function() {
      var self = this,
        circles = self.options.circles;

      this.clear();

      circles.forEach(function(circle) {
        self.drawCircle(circle.x, circle.y, circle.radius, circle.color);
      });
    },

    removeCircle: function(id) {
      var self = this,
        circles = self.options.circles,
        i = 0,
        index = -1;

      for (i = 0; i < circles.length; i += 1) {
        if (circles[i].id === id) {
          index = i;
        }
      }

      // index = circles.findIndex(function(circle) {
      //   parseInt(circle.id, 10) === parseInt(id, 10);
      // });

      if (index !== -1) {
        circles.splice(index, 1);
      }

      self.draw();
    },

    createCircle: function(attrs) {
      var self = this,
        circles = self.options.circles;

      circles.push(attrs);

      self.draw();

      self.undoManager.add({
        undo: self.removeCircle.bind(self, attrs.id),
        redo: self.createCircle.bind(self, attrs)
      });
    }
  });

  return circleDrawer;
});
