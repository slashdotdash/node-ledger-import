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
    pipeline.use(filters.classifyAccount(_.pick(this.options, 'ledger', 'account')));

    return pipeline;
  };

  // Execute the import from the given `csv`
  Import.prototype.run = function(csv) {
    var self = this,
        queue = [];

    csv.on('record', function(row, index){
      self.log('#' + index + ' ' + JSON.stringify(row));
      
      // push the CSV row onto the parsing queue
      queue.push({ data: row, index: index });
    })
    .once('end', function(count){
      self.log('Number of lines: ' + count);
      // parse all transactions from CSV
      self.parseTransactions(queue);
    })
    .on('error', function(error){
      self.log(error.message);
      self.emit('error');
    });
  };

  Import.prototype.parseTransactions = function(queue) {
    var self = this;

    (function parseNext(err, result) {
      if (err) {
        return self.emit('error', err);
      }

      if (result) {
        // emit transaction event on pipeline completion
        self.emit('transaction', result);
      }
      
      // done, with success
      if (queue.length === 0) {
        return self.emit('end');
      }

      var data = queue.shift();

      self.pipeline.execute(data, parseNext);
    })();
  };

  Import.prototype.log = function() {
    if (this.options.log) {
      console.log.apply(console, Array.prototype.slice.call(arguments));
    }
  };

  return Import;
})();

exports.Import = Import;