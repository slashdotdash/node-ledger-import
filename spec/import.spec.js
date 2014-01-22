var csv = require('csv'),
    Import = require('../lib/import').Import;

xdescribe('Import', function() {
  var spec, importer, transactions;

  beforeEach(function(done) {
    spec = this;
    importer = new Import({
      ledger: 'spec/data/example.dat',
      log: true,
      header: false,
      separator: ',',
      currency: '£',
      account: 'Liabilities:Credit Card',
      date: {
        column: 1,
        format: 'DD MMM YY'
      },
      payee: {
        column: 2
      },
      amount: {
        columns: [ 5, 6 ],
        inverse: true
      }
    });
    transactions = [];

    importer.on('transaction', function(transaction) {
      transactions.push(transaction);
    })
    .once('end', function() {
      done();
    })
    .once('error', function(error) {
      spec.fail(error);
      done();
    });

    importer.run(csv().from.string('14 Dec 13,"Payee",MR B SMITH,Household,,1.99'));
  });

  it('should parse a single transaction', function() {
    expect(transactions.length).toBe(1);
  });
});