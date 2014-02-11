var _ = require('lodash'),
    Pipeline = require('pipes-and-filters'),
    filters = require('../transaction');

var transactionExists = function(input) {
  // if transacton already exists in source Ledger file, skip
  return input.exists;
};

var transactionIsSkipped = function(input) {
  // skipped transaction
  return input.skip;
};

// Create the transaction processing pipeline (processes an individual transaction)
var createPipeline = function(options) {
  var pipeline = Pipeline.create('transaction parser');
  
  pipeline.use(filters.parseLedger(_.pick(options, 'ledger')));
  pipeline.use(filters.extractDate(options.date));
  pipeline.use(filters.extractPayee(options.payee));
  pipeline.use(filters.extractAmount(options.amount));
  pipeline.use(filters.matchExistingTransaction());
  pipeline.breakIf(transactionExists);
  pipeline.use(filters.classifyAccount(_.pick(options, 'account')));
  pipeline.use(filters.confirmTransaction());
  pipeline.breakIf(transactionIsSkipped);
  pipeline.use(filters.formatTransaction(_.pick(options, 'account', 'currency')));

  return pipeline;
};

var parseTransactions = function(options) {
  var pipeline = createPipeline(options);

  return function(input, next) {
    var transactions = [],
        queue = input.transactions;

    var parseNext = function parseNext(err, result) {
      if (err) {
        return next(err);
      }

      if (result) {
        // include parsed transaction on pipeline completion
        transactions.push(result);
      }

      var data = queue.shift();

      if (data) {
        pipeline.execute(data, parseNext);
      } else {
        // done, with success
        input.transactions = transactions;

        pipeline.removeListener('break', transactionSkipped);

        next(null, input);
      }
    };

    // continue processing the next transaction in the queue when one is skipped
    var transactionSkipped = function() {
      options.emitter.emit('skipped');
      parseNext();
    };
    
    pipeline.on('break', transactionSkipped);

    parseNext();
  };
};

module.exports = parseTransactions;