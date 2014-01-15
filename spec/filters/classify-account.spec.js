var classifyAccount = require('../../lib/filters/classify-account');

describe('classify account', function() {
  var spec, output;

  beforeEach(function() {
    spec = this;

    this.createFilter = function(options, input, done) {
      var filter = classifyAccount(options);

      filter(input, function(err, result) {
        if (err) {
          console.error(err);
          return spec.fail(err);
        }

        output = result;
        done();
      });
    };
  });

  describe('account exists', function() {
    beforeEach(function(done) {
      this.createFilter({ ledger: 'spec/data/example.dat', account: 'Assets:Current Account' }, { payee: 'Salary' }, done);
    });

    it('should classify to correct account', function() {
      expect(output.account).toEqual('Income:Salary');
    });
  });

  xdescribe('unknown payee', function() {
    beforeEach(function(done) {
      this.createFilter({ ledger: 'spec/data/example.dat', account: 'Assets:Current Account' }, { payee: 'Foo' }, done);
    });

    it('should not classify the account', function() {
      expect(output.account).toEqual('');
    });
  });
});