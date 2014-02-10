var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    Pipeline = require('pipes-and-filters'),
    _ = require('lodash'),
    filters = require('./filters/transactions');

var Import = (function() {
  function Import(options) {
    this.options = _.defaults({}, options);

    EventEmitter.call(this);
  }

  util.inherits(Import, EventEmitter);

  // Execute the import from the given `csv`
  Import.prototype.run = function(csv) {
    var self = this,
        pipeline = Pipeline.create('input');

    // parsing CSV and transactions
    pipeline.use(filters.parseCSV(_.pick(this.options, 'header')));
    pipeline.use(filters.parseTransactions(_.merge(this.options, { emitter: this })));

    // exit early if there are no transactions
    pipeline.use(Pipeline.breakIf(function(input) {
      return input.transactions.length === 0;
    }));

    // output new transactions to destination Ledger file
    pipeline.use(filters.retrieveAccounts(_.pick(this.options, 'ledger')));
    pipeline.use(filters.writeLedger(_.pick(this.options, 'ledger')));
    pipeline.use(filters.formatLedger(_.pick(this.options, 'ledger')));
    pipeline.use(filters.prependAccounts());
    pipeline.use(filters.overwriteLedger(_.pick(this.options, 'ledger')));

    pipeline.execute({ csv: csv }, function(err, result) {
      if (err) {
        return self.emit('error', err);
      }

      if (result === Pipeline.break) {
        return self.emit('end', { transactions: [] });
      }

      self.emit('end', { transactions: result.transactions });
    });
  };

  return Import;
})();

exports.Import = Import;