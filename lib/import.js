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
    
    pipeline.use(filters.parseLedger(_.pick(this.options, 'ledger', 'threshold')));
    pipeline.use(filters.extractDate(this.options.date));
    pipeline.use(filters.extractPayee(this.options.payee));
    pipeline.use(filters.extractAmount(this.options.amount));
    pipeline.use(filters.skipExistingTransactions());
    pipeline.use(filters.classifyAccount(_.pick(this.options, 'account')));
    pipeline.use(filters.confirmTransaction());
    pipeline.use(filters.formatTransaction(_.pick(this.options, 'account', 'currency')));

    return pipeline;
  };

  // Execute the import from the given `csv`
  Import.prototype.run = function(csv) {
    var self = this,
        queue = [],
        count = 0;

    csv.on('record', function(row, index){
      self.log('#' + index + ' ' + JSON.stringify(row));

      // skip empty rows
      if (row.length === 0 || row.length === 1) {
        return;
      }
      
      // skip header
      if (self.options.header && count === 0) {
        count++;
        return;
      }
      
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
        if (result.skip) {
          self.emit('skipped', result);
        } else {
          // emit transaction event on pipeline completion
          self.emit('transaction', result);
        }
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