var parseLedger = require('../../../lib/filters/transaction/parse-ledger');

describe('parse Ledger file', function() {
  var spec, output;

  beforeEach(function() {
    spec = this;

    this.createFilter = function(options, input, done) {
      var filter = parseLedger(options);

      filter(input, function(err, result) {
        if (err) {
          spec.fail(err);
          return done();
        }

        output = result;
        done();
      });
    };
  });

  describe('file exists', function() {
    beforeEach(function(done) {
      this.createFilter({ ledger: 'spec/data/example.dat' }, { }, done);
    });

    it('should parse transactions', function() {
      expect(output.transactions.length).toNotBe(0);
    });
  });
});