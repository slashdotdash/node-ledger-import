var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    Pipeline = require('node-pipeline'),
    _ = require('lodash'),
    extractDate = require('./filters/extract-date');

var Import = (function() {
  function Import(options) {
    this.options = _.defaults({}, options);
    this.pipeline = this.createPipeline();

    EventEmitter.call(this);
  }

  util.inherits(Import, EventEmitter);

  // Create the transaction processing pipeline (processes an individual transaction)
  Import.prototype.createPipeline = function() {
    var pipeline = Pipeline.create('transaction parser');
    
    pipeline.use(extractDate(this.options.date));

    // emit transaction event on pipeline completion
    pipeline.on('end', _.bind(function(err, result) {
      this.emit('transaction', result);
    }, this));

    return pipeline;
  };

  // Execute the import from the given `csv`
  Import.prototype.run = function(csv) {
    var self = this,
        pipeline = this.pipeline;

    csv.on('record', function(row, index){
      self.log('#' + index + ' ' + JSON.stringify(row));
      // process the CSV row
      pipeline.execute({ data: row, index: index });
    })
    .once('end', function(count){
      self.log('Number of lines: '+count);
      self.emit('end');
    })
    .on('error', function(error){
      self.log(error.message);
      self.emit('error');
    });
  };

  Import.prototype.log = function() {
    if (this.options.log) {
      console.log.apply(console, Array.prototype.slice.call(arguments));
    }
  };

  return Import;
})();

exports.Import = Import;