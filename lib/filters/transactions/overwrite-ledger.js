var fs = require('fs');

var overwriteLedger = function(options) {
  if (!options.ledger) {
    throw {
      name: 'OptionsError',
      message: 'Ledger file has not been specified'
    };
  }

  return function(input, next) {
    var reader = fs.createReadStream(input.outputPath),
        writer = fs.createWriteStream(options.ledger);

    reader.pipe(writer);

    writer.once('error', function(err) {
      next(err);
    });

    writer.once('finish', function() {
      next(null, input);
    });
  };
};

module.exports = overwriteLedger;