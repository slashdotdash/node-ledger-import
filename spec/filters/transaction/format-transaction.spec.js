var formatTransaction = require('../../../lib/filters/transaction/format-transaction');

describe('format transaction', function() {
  var spec, filter, output;

  beforeEach(function() {
    spec = this;
    filter = formatTransaction({ account: 'Assets:Current Account', currency: '£' });
  });

  describe('from source account', function() {
    beforeEach(function(done) {
      filter({ date: new Date(2014, 0, 20), payee: 'Mortgage payment', account: 'Expenses:Mortgage', amount: -1000 }, function(err, result) {
        if (err) {
          spec.fail(err);
          return done();
        }

        output = result;
        done();
      });
    });

    it('should format the transaction', function() {
      expect(output.formatted).toEqual([
        '2014/01/20 Mortgage payment',
        '\tExpenses:Mortgage\t\t£1,000.00',
        '\tAssets:Current Account'
      ].join('\n'));
    });
  });

  describe('to source account', function() {
    beforeEach(function(done) {
      filter({ date: new Date(2014, 0, 20), payee: 'Salary', account: 'Income:Salary', amount: 1234.56 }, function(err, result) {
        if (err) {
          spec.fail(err);
          return done();
        }

        output = result;
        done();
      });
    });

    it('should format the transaction', function() {
      expect(output.formatted).toEqual([
        '2014/01/20 Salary',
        '\tAssets:Current Account\t\t£1,234.56',
        '\tIncome:Salary'
      ].join('\n'));
    });
  });
});