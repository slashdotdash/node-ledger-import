var extractPayee = require('../../../lib/filters/transaction/extract-payee');

describe('extract payee', function() {
  var spec, filter, output;

  beforeEach(function() {
    spec = this;
    filter = extractPayee({ column: 1 });
  });

  describe('valid payee', function() {
    beforeEach(function(done) {
      filter({ data: [ 'Mortgage' ] }, function(err, result) {
        if (err) {
          spec.fail(err);
          return done();
        }

        output = result;
        done();
      });
    });

    it('should parse', function() {
      expect(output.payee).toEqual('Mortgage');
    });
  });

  describe('invalid payee', function() {
    var error, output;

    beforeEach(function(done) {
      filter({ data: [ '' ] }, function(err, result) {
        error = err;
        output = result;
        done();
      });
    });

    it('should fail to parse', function() {
      expect(error).toNotBe(null);
    });

    it('should not output any data', function() {
      expect(output).toBeUndefined(null);
    });
  });
});