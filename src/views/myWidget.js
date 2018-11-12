define(
  [
    "jquery.plugins",
    "common/ObjectUtils",
    "axios",
    "constants/index",
    "./connect",
    "reducers/selectors",
    "hbs!./myWidget",
    "css!./myWidget"
  ],
  function($, ObjectUtils, axios, constants, connect, selectors, template) {
    "use strict";

    const {
      FETCH_DATA_PENDING,
      FETCH_DATA_FULFILLED,
      FETCH_DATA_REJECTED
    } = constants;

    /**
     * Books widget.
     * @class myWidget
     * @memberof views.myWidget
     */
    const myWidget = $.widget("ux.myWidget", {
      options: {
        className: "ux-widget",
        title: "Unavailable"
      },

      _create: function() {
        this.element.addClass(this.options.className);

        this._render();
        this._bindListener();
        this._super();
      },

      _setOption: function(key, value) {
        var prev = this.options[key],
          fnMap = {
            books: function() {
              // do somthing here.
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

      _refresh: function(books) {
        this.element.html(template({ books }));
      },

      /**
       * The imported template should be used here to create the layout.
       * @private
       */
      _render: function() {
        const { books = [] } = this.options;

        // create the dom of this gadget using its template.
        this.element.html(template({ books }));
      },

      _fetchData: function(event, data) {
        this.options.fetchData(data.handle);
      },

      _loadData: function() {
        this._getFilters();
      },

      _loadFilters: function() {
        axios
          .get("/filters")
          .then(({ data }) => {
            dispatch({
              type: FETCH_FILTER_FULFILLED,
              payload: data
            });
          })
          .catch(err => {
            dispatch({
              type: FETCH_FILTER_REJECTED,
              payload: err
            });
          });
      },

      /**
       * Bind event listener.
       * @private
       */
      _bindListener: function() {
        var self = this;

        // refresh on changes to books
        this.element.on("mywidgetsetoption", function(event, data) {
          if (
            data.option === "books" &&
            !ObjectUtils.shallowEqual(data.current, data.previous)
          ) {
            self._refresh(data.current);
          }
        });

        self.element.on("click", "#submit", function() {
          self._fetchData(null, {
            handle: self.element.find("#handle").val()
          });
        });

        self.element.on("keyup", "#handle", function() {
          if (event.keyCode === 13) {
            $("#submit").click();
          }
        });
      }
    });

    return connect(
      // Given Redux state, return props
      state => ({
        books: selectors.getBooks(state),
        isLoading: selectors.isLoading(state)
      }),
      // Given Redux dispatch, return callback props
      dispatch => ({
        fetchData(query) {
          dispatch({
            type: FETCH_DATA_PENDING,
            payload: query
          });
          axios
            .get(
              `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=40`
            )
            .then(({ data }) => {
              dispatch({
                type: FETCH_DATA_FULFILLED,
                payload: data
              });
            })
            .catch(err => {
              dispatch({
                type: FETCH_DATA_REJECTED,
                payload: err
              });
            });
        }
      })
    )(myWidget, window.store);
  }
);
