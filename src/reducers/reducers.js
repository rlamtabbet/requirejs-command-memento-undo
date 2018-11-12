define(["../constants/index", "redux"], function(constants, Redux) {
  "use strict";

  const errorReducer = (state = {}, action = {}) => {
    switch (action.type) {
      case "500":
        return { ...state, name: action.payload };
      case "404":
        return { ...state, handle: action.payload };
      case "ERR":
        throw new Error(action.payload);
      default:
        return state;
    }
  };

  const userReducer = (state = {}, action = {}) => {
    switch (action.type) {
      case "CHANGE_NAME":
        return { ...state, name: action.payload };
      case "CHANGE_HANDLE":
        return { ...state, handle: action.payload };
      default:
        return state;
    }
  };

  const initialState = {
    pending: false,
    fetched: false,
    error: null,
    items: []
  };

  const {
    FETCH_DATA_PENDING,
    FETCH_DATA_FULFILLED,
    FETCH_DATA_REJECTED,
    CLEAR_ALL,
    ERROR,
    USER,
    BOOKS
  } = constants;

  const bookReducer = (state = initialState, action = {}) => {
    switch (action.type) {
      case FETCH_DATA_PENDING:
        return { ...state, pending: true, fetched: false };
      case FETCH_DATA_FULFILLED:
        return {
          ...state,
          pending: false,
          fetched: true,
          items: action.payload.items
        };
      case FETCH_DATA_REJECTED:
        return {
          ...state,
          pending: false,
          error: action.payload
        };
      case CLEAR_ALL:
        return initialState;
      default:
        return state;
    }
  };

  const reducers = Redux.combineReducers({
    [ERROR]: errorReducer,
    [USER]: userReducer,
    [BOOKS]: bookReducer
  });

  return reducers;
});
