var _ = require('lodash'),
    Bayesian = require('classifier').Bayesian;

var trainClassifier = function(classifier, transactions, account) {
  _.each(transactions, function(entry) {
    var payee = entry.payee;

    var posting = _.find(entry.postings, function(p) {
      return (p.account !== account);
    });

    if (posting) {
      classifier.train(payee, posting.account);
    }
  });
};

// Use Naive Bayes classification to match account from payee name
var classifyAccount = function(options) {
  options = _.defaults(options, { threshold: 0.5 });

  if (!options.account) {
    throw {
      name: 'OptionsError',
      message: 'Account has not been specified'
    };
  }

  var classifier = new Bayesian(),
      trained = false;

  return function(input, next) {
    if (!trained) {
      trainClassifier(classifier, input.transactions, options.account);
      trained = true;
    }

    var payee = input.payee,
        classification = classifier.classify(payee);

    if (classification) {
      next(null, _.merge(input, { account: classification }));
    } else {
      next(null, _.merge(input, {
        account: null,
        error: 'Failed to classify payee "' + payee + '"'
      }));
    }
  };
};

module.exports = classifyAccount;