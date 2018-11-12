require(["redux", "thunk", "reducers/reducers"], function(
  redux,
  thunk,
  reducers
) {
  const { createStore, applyMiddleware, compose } = redux;

  const loggerMiddleware = ({ getState }) => next => action => {
    logger.info("will dispatch", action);

    // Call the next dispatch method in the middleware chain.
    const returnValue = next(action);

    logger.info("state after dispatch", getState());

    // This will likely be the action itself, unless
    // a middleware further in chain changed it.
    return returnValue;
  };

  const errorMiddleware = () => next => action => {
    try {
      next(action);
    } catch (e) {
      logger.error("AHHHHH!! ", e);
    }
  };

  const middleware = [thunk.default, loggerMiddleware, errorMiddleware];
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const store = createStore(
    reducers,
    /* preloadedState, */ composeEnhancers(applyMiddleware(...middleware))
  );

  window.store = store;

  return store;
});
