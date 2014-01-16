var extractAmount = require('../../lib/filters/extract-amount');

describe('extract amount', function() {
  var spec, output;

  beforeEach(function() {
    spec = this;

    this.createFilter = function(options, data, done) {
      var filter = extractAmount(options);

      filter({ data: data }, function(err, result) {
        if (err) { spec.fail(err); done(); }

        output = result;
        done();
      });
    };
  });

  describe('single amount column', function() {
    describe('valid amount', function() {
      beforeEach(function(done) {
        this.createFilter({ column: 1 }, [ '1.99' ], done);
      });

      it('should parse', function() {
        expect(output.amount).toEqual(1.99);
      });
    });

    describe('inverse', function() {
      beforeEach(function(done) {
        this.createFilter({ column: 1, inverse: true }, [ '1.99' ], done);
      });

      it('should parse', function() {
        expect(output.amount).toEqual(-1.99);
      });
    });
  });

  describe('multi-column amounts', function() {
    describe('valid amount', function() {
      beforeEach(function(done) {
        this.createFilter({ from: { column: 1 }, to: { column: 2 } }, [ '1.99', '' ], done);
      });

      it('should parse', function() {
        expect(output.amount).toEqual(1.99);
      });
    });
  });
});