var _ = require('lodash'),
    Pipeline = require('../pipeline');

// Create the transaction processing pipeline (processes an individual transaction)
var createPipeline = function(options) {
  var filters = options.filters,
      pipeline = Pipeline.create('transaction parser');
  
  pipeline.use(filters.parseLedger(_.pick(options, 'ledger', 'threshold')));
  pipeline.use(filters.extractDate(options.date));
  pipeline.use(filters.extractPayee(options.payee));
  pipeline.use(filters.extractAmount(options.amount));
  pipeline.use(filters.skipExistingTransactions());
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
        if (result.skip) {
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
        next(null, _.merge(input, { transactions: transactions }));
      }
    })();
  };
};

module.exports = parseTransactions;