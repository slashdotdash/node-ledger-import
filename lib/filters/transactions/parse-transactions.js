var _ = require('lodash'),
    Pipeline = require('pipes-and-filters'),
    filters = require('../transaction');

var skipExistingTransaction = function() {
  return Pipeline.breakIf(function(input) {
    // if transacton already exists in source Ledger file, skip
    return input.exists;
  });
};

// Create the transaction processing pipeline (processes an individual transaction)
var createPipeline = function(options) {
  var pipeline = Pipeline.create('transaction parser');
  
  pipeline.use(filters.parseLedger(_.pick(options, 'ledger')));
  pipeline.use(filters.extractDate(options.date));
  pipeline.use(filters.extractPayee(options.payee));
  pipeline.use(filters.extractAmount(options.amount));
  pipeline.use(filters.matchExistingTransaction());
  pipeline.use(skipExistingTransaction());
  pipeline.use(filters.classifyAccount(_.pick(options, 'account')));
  pipeline.use(filters.confirmTransaction());
  pipeline.use(filters.formatTransaction(_.pick(options, 'account', 'currency')));

  return pipeline;
};

var parseTransactions = function(options) {
  var pipeline = createPipeline(options);

  return function(input, next) {
    var transactions = [],
        queue = input.transactions;

    (function parseNext(err, result) {
      if (err) {
        return next(err);
      }

      if (result) {
        if (result === Pipeline.break) {
          options.emitter.emit('skipped', result);
        } else {
          // include parsed transaction on pipeline completion
          transactions.push(result);
        }
      }

      var data = queue.shift();

      if (data) {
        pipeline.execute(data, parseNext);
      } else {
        // done, with success
        input.transactions = transactions;

        next(null, input);
      }
    })();
  };
};

module.exports = parseTransactions;