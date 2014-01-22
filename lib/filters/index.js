module.exports = {
  classifyAccount: require('./classify-account'),
  confirmTransaction: require('./confirm-transaction'),
  extractAmount: require('./extract-amount'),
  extractDate: require('./extract-date'),
  extractPayee: require('./extract-payee'),
  parseLedger: require('./parse-ledger'),
  skipExistingTransactions: require('./skip-existing-transactions')
};