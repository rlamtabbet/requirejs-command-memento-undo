define(["../constants/index", "vo/bookVO"], function(constants, bookVO) {
  "use strict";

  const { BOOKS } = constants;

  // PRIVATE SELECTORS

  function isLoadingBooks(store) {
    return store.pending;
  }

  function getBooksItems(store) {
    return store.items.map(item => new bookVO(item.volumeInfo));
  }

  const FromBooks = {
    isLoading: isLoadingBooks,
    getBooks: getBooksItems
  };

  // PUBLIC SELECTORS
  const isLoading = store => FromBooks.isLoading(store[BOOKS]);
  const getBooks = store => FromBooks.getBooks(store[BOOKS]);

  return {
    isLoading,
    getBooks
  };
});
