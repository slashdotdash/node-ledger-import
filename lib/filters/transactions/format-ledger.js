var temp = require('temp'),
    Ledger = require('ledger-cli').Ledger;

var formatLedger = function() {
  return function(input, next) {
    var path = input.outputPath,
        ledger = new Ledger({ file: path }),
        writer = temp.createWriteStream();

    // pretty print the Ledger file
    ledger.print().pipe(writer);

    writer.once('error', function(err) {
      next(err);
    });

    writer.once('finish', function() {
      input.outputPath = writer.path;

      next(null, input);
    });
  };
};

module.exports = formatLedger;