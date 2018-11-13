define([
  "jquery.plugins",
  "common/idGenerator",
  "hbs!widgets/circleDrawer/circleDrawer",
  "css!widgets/circleDrawer/circleDrawer"
], function($, IDGenerator, template) {
  "use strict";

  var CANVAS_WIDTH = 600,
    CANVAS_HEIGHT = 400,
    MIN_RADIUS = 10,
    MAX_RADIUS = 40,
    circleDrawer;

  function getRandomColor() {
    var intColor = Math.floor(Math.random() * (256 * 256 * 256)),
      hexColor = parseInt(intColor, 10).toString(16);

    return "#" + (hexColor.length < 2 ? "0" + hexColor : hexColor);
  }

  function getRandomRadius() {
    return MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS);
  }

  function hasSameColor(color, circle) {
    return circle.color === color;
  }

  function rgb2hex(rgb) {
    rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
    function hex(x) {
      return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
  }

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

      if (drawingCanvas.getContext !== undefined) {
        this.drawingContext = drawingCanvas.getContext("2d");
      }
    },

    /**
     * Bind event listener.
     * @private
     */
    _bindListener: function() {
      var self = this;

      self.element.on("click", "#view", function(evt) {
        var drawingCanvas = self.drawingCanvas,
          color = getRandomColor(),
          radius = getRandomRadius(),
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

      self.element.on("contextmenu", "#view", function(evt) {
        var circles = self.options.circles,
          drawingCanvas = self.drawingCanvas,
          drawingContext = self.drawingContext,
          color = getRandomColor(),
          radius = getRandomRadius(),
          mouseX = 0,
          mouseY = 0,
          pixel,
          pixelColor,
          prevCircle,
          nextCircle;

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

        // get pixel under cursor
        pixel = drawingContext.getImageData(mouseX, mouseY, 1, 1).data;

        pixelColor = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;

        prevCircle = circles.find(function(circle) {
          return hasSameColor(rgb2hex(pixelColor), circle);
        });

        if (prevCircle) {
          nextCircle = $.extend({}, prevCircle, {
            x: mouseX,
            y: mouseY,
            color: color,
            radius: radius
          });

          self.updateCircle(prevCircle.id, nextCircle);

          // An alternative implementation to the Memento Pattern is to store
          // the operations that are being used to change the state of the application
          // rather than the state itself. This may require significantly fewer
          // resources.
          self.undoManager.queue({
            undo: self.updateCircle.bind(self, prevCircle.id, prevCircle),
            redo: self.updateCircle.bind(self, prevCircle.id, nextCircle)
          });
        }

        return false;
      });
    },

    _setOption: function(key, value) {
      var self = this,
        prev = this.options[key],
        fnMap = {
          circles: function() {
            // re-draw
            self.draw();
          }
        };

      // base
      this._super(key, value);

      if (key in fnMap) {
        fnMap[key]();

        // Fire event
        this._triggerOptionChanged(key, prev, value);
      }
    },

    _triggerOptionChanged: function(optionKey, previousValue, currentValue) {
      this._trigger(
        "setOption",
        { type: "setOption" },
        {
          option: optionKey,
          previous: previousValue,
          current: currentValue
        }
      );
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

    updateCircle: function(id, nextCircle) {
      var self = this,
        circles = self.options.circles,
        index = -1;

      index = circles.findIndex(function(circle) {
        return circle.id === id;
      });

      if (index !== -1) {
        circles.splice(index, 1, nextCircle);
      }

      self.option("circles", circles);
    },

    removeCircle: function(id) {
      var self = this,
        circles = self.options.circles,
        index = -1;

      index = circles.findIndex(function(circle) {
        return circle.id === id;
      });

      if (index !== -1) {
        circles.splice(index, 1);
      }

      self.option("circles", circles);
    },

    createCircle: function(attrs) {
      var self = this,
        circles = self.options.circles;

      circles.push(attrs);

      self.option("circles", circles);

      // An alternative implementation to the Memento Pattern is to store
      // the operations that are being used to change the state of the application
      // rather than the state itself. This may require significantly fewer
      // resources.
      self.undoManager.queue({
        undo: self.removeCircle.bind(self, attrs.id),
        redo: self.createCircle.bind(self, attrs)
      });
    }
  });

  return circleDrawer;
});
