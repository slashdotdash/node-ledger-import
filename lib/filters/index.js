module.exports = {
  extractAmount: require('./extract-amount'),
  extractDate: require('./extract-date'),
  extractPayee: require('./extract-payee'),
  classifyAccount: require('./classify-account'),
  parseLedger: require('./parse-ledger'),
  skipExistingTransactions: require('./skip-existing-transactions')
};