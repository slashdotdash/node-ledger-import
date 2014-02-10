# Ledger Import

Import accounting transactions from a CSV file into Ledger, using naive Bayesian learning to identify accounts from each payee.  Heavily inspired by the Reckon Ruby gem.

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

    npm install -g ledger-import

Then run the import tool, providing the relevant command line arguments for the CSV you are attempting to parse.

    ledger-import --file /path/to/transactions.csv --account 'Assets:Current Account' --ledger /path/to/ledger.dat --currency '£' --contains-header --date-column 1 --date-format 'DD/MM/YYYY' --payee-column 2 --amount-column 3

### Command line help

	$ ledger-import

	Usage: ledger-import [options]

	Options:

	-h, --help                   output usage information
	-V, --version                output the version number
	-f, --file <file>            The CSV file to parse
	-a, --account <name>         The Ledger Account this file is for
	-i, --inverse                Use the negative of each amount
	-v, --verbose                Run verbosely
	-l, --ledger <file>          An existing ledger file to learn accounts from
	-c, --currency <symbol>      Currency symbol to use, defaults to £ ($, EUR)
	--contains-header            The first row of the CSV is a header and should be skipped
	--csv-separator <separator>  Separator for parsing the CSV, default is comma.
	--date-column <number>       Column containing the date in the CSV file, the first column is column 1
	--date-format <string>       Force the date format
	--payee-column <number>      Column containing the payee (description) in the CSV file
	--amount-column <number>     Column containing the amount in the CSV file
	--amount-columns <numbers>   Multiple columns containing the amount in the CSV file
