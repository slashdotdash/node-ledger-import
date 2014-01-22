var Pipeline = (function() {
  function Pipeline(name) {
    this.name = name;
    this.filters = [];
  }
 
  // Adds a filter function to the pipeline chain.
  Pipeline.prototype.use = function(filter) {
    this.filters.push(filter);

    return this;
  };
 
  // Start the execution of the pipeline.
  Pipeline.prototype.execute = function(input, done) {
    var pending = Array.prototype.slice.call(this.filters);
 
    (function nextFilter(err, result) {
      // done, with error
      if (err) {
        return done && done(err);
      }
 
      // exit early or done, with success
      if (pending.length === 0 || result.skip) {
        return done && done(null, result);
      }
 
      // next filter and continue execution
      var filter = pending.shift();
    
      filter(result, nextFilter);
      
    })(null, input);
  };
 
  return Pipeline;
})();

exports.create = function(name) {
  return new Pipeline(name);
};