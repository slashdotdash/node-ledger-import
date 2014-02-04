var fs = require('fs'),
    temp = require('temp'),
    _ = require('lodash');

var formatAccounts = function(accounts) {
  return _.map(accounts, function(account) { return 'account ' + account; }).join('\n');
};

var prependAccounts = function() {
  return function(input, next) {
    var reader = fs.createReadStream(input.outputPath, { flags: 'r', encoding: 'utf-8' }),
        writer = temp.createWriteStream();

    // write list of accounts (e.g. "account Assets:Current Account")
    writer.write(formatAccounts(input.accounts));
    writer.write('\n\n');

    // write contents of (formatted) Ledger
    reader.pipe(writer);

    writer.once('error', function(err) {
      next(err);
    });

    writer.once('finish', function() {
      input.outputPath = writer.path;

      next(null, input);
    });
  };
};

module.exports = prependAccounts;