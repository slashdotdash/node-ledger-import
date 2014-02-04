var classifyAccount = require('../../../lib/filters/transaction/classify-account');

describe('classify account', function() {
  var spec, output, transactions;

  beforeEach(function() {
    spec = this;

    this.createFilter = function(options, input, done) {
      var filter = classifyAccount(options);

      filter(input, function(err, result) {
        if (err) {
          spec.fail(err);
          return done();
        }

        output = result;
        done();
      });
    };

    transactions = [
      {
        date: new Date(),
        payee: 'Salary',
        postings: [
          {
            account: 'Assets:Current Account',
            commodity: {
              currency: '£',
              amount: 1000,
              formatted: '£1,000.00'
            }
          },
          {
            account: 'Income:Salary',
            commodity: {
              currency: '£',
              amount: -1000,
              formatted: '£-1,000.00'
            }
          }
        ]
      },
      {
        date: new Date(),
        payee: 'Mortgage payment',
        postings: [
          {
            account: 'Expenses:Mortgage',
            commodity: {
              currency: '£',
              amount: 500,
              formatted: '£500.00'
            }
          },
          {
            account: 'Assets:Current Account',
            commodity: {
              currency: '£',
              amount: -500,
              formatted: '£-500.00'
            }
          }
        ]
      }
    ];
  });

  describe('account exists', function() {
    beforeEach(function(done) {
      this.createFilter({ account: 'Assets:Current Account' }, { transactions: transactions, payee: 'Salary' }, done);
    });

    it('should classify to correct account', function() {
      expect(output.account).toEqual('Income:Salary');
    });
  });

  xdescribe('unknown payee', function() {
    beforeEach(function(done) {
      this.createFilter({ account: 'Assets:Current Account', threshold: 0.5 }, { transactions: transactions, payee: 'Foo' }, done);
    });

    it('should not classify the account', function() {
      expect(output.account).toEqual(null);
    });

    it('should provide error message', function() {
      expect(output.error).toEqual('Failed to classify payee "Foo"');
    });
  });
});