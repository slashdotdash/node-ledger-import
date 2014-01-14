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

### Example config

var config = {
  header: false,
  separator: ',',
  currency: '£',
  account: 'Liabilities:Credit Card',
  date: {
    column: 1,
    format: '%d %b %y'
  },
  payee: {
    column: 2
  },
  amount: {
    from: {
      column: 6
    },
    to: {
      column: 5,
      inverse: true
    }
  }
};

### Input/Output

Converts CSV transactions ...

	14 Dec 13,"Payee",MR B SMITH,Household,,4.99

... to Ledger format

	2013/1/14 Payee
		Expenses:Home               £4.99
		Liabilities:Credit Card