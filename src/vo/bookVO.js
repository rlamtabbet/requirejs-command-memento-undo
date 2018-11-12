define([], function() {
  // using google book api model options
  var bookVO = function(options) {
    return {
      ...options,
      toString: function() {
        var date = new Date(this.publishedDate);

        return this.title + ", (" + date.toDateString() + ")";
      }
    };
  };

  return bookVO;
});
