var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    Pipeline = require('./pipeline'),
    _ = require('lodash'),
    filters = require('./filters');

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
    
    pipeline.use(filters.extractDate(this.options.date));
    pipeline.use(filters.extractPayee(this.options.payee));
    pipeline.use(filters.extractAmount(this.options.amount));

    return pipeline;
  };

  // Execute the import from the given `csv`
  Import.prototype.run = function(csv) {
    var self = this;

    csv.on('record', function(row, index){
      self.log('#' + index + ' ' + JSON.stringify(row));
      // process the CSV row
      self.parseTransaction({ data: row, index: index });
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

  Import.prototype.parseTransaction = function(data) {
    this.pipeline.execute(data, function(err, result) {
      if (err) {
        return console.error('Error parsing transaction: ' + err);
      }

      // emit transaction event on pipeline completion
      this.emit('transaction', result);
    }.bind(this));
  };

  Import.prototype.log = function() {
    if (this.options.log) {
      console.log.apply(console, Array.prototype.slice.call(arguments));
    }
  };

  return Import;
})();

exports.Import = Import;