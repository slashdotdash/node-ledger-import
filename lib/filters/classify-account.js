var _ = require('lodash'),
    BayesClassifier = require('natural').BayesClassifier,
    Ledger = require('ledger-cli').Ledger;

var trainClassifier = function(ledger, classifier, account, done) {
  ledger.register()
    .on('data', function(entry) {
      var payee = entry.payee;

      var posting = _.find(entry.postings, function(p) {
        return (p.account !== account);
      });

      if (posting) {
        classifier.addDocument(payee, posting.account);
      }
    })
    .once('end', function(){
      // completed
      classifier.train();
      done();
    })
    .on('error', function(error) {
      // error
      done(error);
    });
};

// Use Naive Bayes classification to match account from payee name
var classifyAccount = function(options) {
  if (!options.ledger) {
    throw {
      name: 'OptionsError',
      message: 'Ledger file has not been specified'
    };
  }

  var ledger = new Ledger({ file: options.ledger }),
      classifier = new BayesClassifier();

  return function(input, next) {
    trainClassifier(ledger, classifier, options.account, function(err) {
      if (err) {
        return next('Failed to classify account, encountered problem when training. ' + err);
      }

      var payee = input.payee,
          account = classifier.classify(payee);

      // console.log(classifier.classify(payee));
      // console.log(classifier.getClassifications(payee));

      if (account) {
        next(null, _.merge(input, { account: account }));
      } else {
        next('Failed to classify payee "' + payee + '"');
      }
    });
  };
};

module.exports = classifyAccount;