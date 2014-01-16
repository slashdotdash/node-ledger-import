var _ = require('lodash'),
    LogisticRegressionClassifier = require('natural').LogisticRegressionClassifier;

var trainClassifier = function(classifier, transactions, account) {
  _.each(transactions, function(entry) {
    var payee = entry.payee;

    var posting = _.find(entry.postings, function(p) {
      return (p.account !== account);
    });

    if (posting) {
      classifier.addDocument(payee, posting.account);
    }
  });
    
  classifier.train();
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

  var classifier = new LogisticRegressionClassifier(),
      trained = false;

  return function(input, next) {
    if (!trained) {
      trainClassifier(classifier, input.transactions, options.account);
      trained = true;
    }

    var payee = input.payee,
        classifications = classifier.getClassifications(payee);

    var account = _.find(classifications, function(classification) {
      return parseFloat(classification.value, 10) > options.threshold;
    });

    if (account) {
      next(null, _.merge(input, { account: account.label }));
    } else {
      next(null, _.merge(input, {
        account: null,
        error: 'Failed to classify payee "' + payee + '"'
      }));
      // next('Failed to classify payee "' + payee + '"');
    }
  };
};

module.exports = classifyAccount;