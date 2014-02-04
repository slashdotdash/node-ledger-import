var extractDate = require('../../../lib/filters/transaction/extract-date');

describe('extract date', function() {
  var spec, filter, output;

  beforeEach(function() {
    spec = this;
    filter = extractDate({ format: 'DD MMM YY', column: 1 });
  });

  describe('valid date', function() {
    beforeEach(function(done) {
      filter({ data: [ '14 Dec 13' ] }, function(err, result) {
        if (err) {
          spec.fail(err);
          return done();
        }

        output = result;
        done();
      });
    });

    it('should parse the date given a date format string', function() {
      expect(output.date).toEqual(new Date(2013, 11, 14));
    });
  });

  describe('invalid date', function() {
    var error, output;

    beforeEach(function(done) {
      filter({ data: [ 'invalid' ] }, function(err, result) {
        error = err;
        output = result;
        done();
      });
    });

    it('should fail to parse an invalid date', function() {
      expect(error).toNotBe(null);
    });

    it('should not output any data', function() {
      expect(output).toBeUndefined(null);
    });
  });
});