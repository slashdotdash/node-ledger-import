# Ledger Import

Import accounting transactions from a CSV into Ledger.

> Ledger is a powerful, double-entry accounting system that is accessed from the UNIX command-line.

## Dependencies

  * [Ledger 3](http://ledger-cli.org/)
  * [Node.js](nodejs.org) and npm

### Installing Ledger

The simplest way to install Ledger 3 is through [Homebrew](http://mxcl.github.com/homebrew/).

    brew install ledger --HEAD

The `--HEAD` option is required to install version 3.x.

## Usage

Install `ledger-import` and its dependencies with npm.

    npm install ledger-import

Then run the import tool, providing the relevant command line arguments for the CSV you are attempting to parse.

    ledger-import --file /path/to/transactions.csv --account 'Assets:Current Account' --ledger /path/to/ledger.dat --currency '£' --contains-header --date-column 1 --date-format 'DD/MM/YYYY' --payee-column 2 --amount-column 3