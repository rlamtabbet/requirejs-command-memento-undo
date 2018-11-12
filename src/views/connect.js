define(["jquery.plugins"], function($) {
  "use strict";

  return function connect(mapStateToProps, mapDispatchToProps) {
    return function(WrappedWidget, store) {
      var widgetName = WrappedWidget.prototype.widgetName,
        namespace = WrappedWidget.prototype.namespace;

      /**
       * Redux connected widget.
       */
      return $.widget(namespace + "." + widgetName, WrappedWidget, {
        options: $.extend(
          {},
          mapStateToProps(store.getState()),
          mapDispatchToProps(store.dispatch) || {}
        ),

        handleChange() {
          var state = mapStateToProps(store.getState());

          this.option(state);
        },

        _create: function() {
          this.unsubscribe = store.subscribe(this.handleChange.bind(this));

          this._super();
        },

        /**
         * Clean up.
         * @private
         */
        _destroy: function() {
          // Unsubscribe from the redux store
          this.unsubscribe();
          this._super();
        }
      });
    };
  };
});
