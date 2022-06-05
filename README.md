# Huff Debug

_An easy hevm debug integration for hardhat-huff projects_
 
## What does it do:

Speed up your development experience by gaining rich feedback in a [hevm](https://github.com/dapphub/dapptools/tree/master/src/hevm) debugger, step through each opcode of your huff projects line by line to find out what went wrong and spot possible optimizations.


### What is [hevm](https://github.com/dapphub/dapptools/tree/master/src/hevm)

In the words of the developers themselves: _The hevm project is an implementation of the Ethereum virtual machine (EVM) made specifically for symbolic execution, unit testing and debugging of smart contracts. It is developed by DappHub and integrates especially well with the dapp tool suite. The hevm command line program can symbolically execute smart contracts, run unit tests, interactively debug contracts while showing the Solidity source, or run arbitrary EVM code. Computations can be performed using local state set up in a dapp testing harness, or fetched on demand from live networks using rpc calls._

More importantly hevm supports an interactive debugger, this allows you to step through execution of arbitrary bytecode line by line, seeing that huff exposes the developer to the evm directly you can essentially debug your huff projects  line by line. 

## Installation
**REQUIRED**
This plugin has a strong dependency in hevm existing within your $PATH. (It wont work at all without it). Before going any further [please install it here](https://github.com/dapphub/dapptools#installation).

Once that is taken care of, go ahead and install hardhat huff and the huff-debug package using your favourite node package manager:
```bash
npm install hardhat-huff huff-debug
```

Import the plugin in your `hardhat.config.js`:

```js
require("huff-debug");
```

Or if you are using TypeScript, in your `hardhat.config.ts`:

```ts
import "huff-debug";
```


## Required plugins

- [@hardhat-huff](https://github.com/huff-language/hardhat-huff)

## Tasks

### huff-debug

This plugin adds the `huff-debug` task to hardhat.
#### Usage:
```
npx hardhat help huff-debug 
Hardhat version 2.8.0

Usage: hardhat [GLOBAL OPTIONS] huff-debug [--reset] [--state] file func args

OPTIONS:

  --reset       Reset hevm state 
  --state       Use maintained hevm state 

POSITIONAL ARGUMENTS:

  file          -- The file name that the target function exists within
  func          -- The function name being targeted
  args          -- Comma separated list of function arguments e.g. - 0x0000000000000000000000000000000000000069,1

huff-debug: 

For global options help run: hardhat help
```

A huff interface consists of definitions that looks as follows:
`#define function mint(address,uint256) nonpayable returns ()`
The anatomy of this definition is something like this: 
`function <functionName>(<args>) <decorators>`

To run your function with huff-debug simply name your target file, function name and args!

Full example: `npx hardhat huff-debug ERC721.huff mint 0x0000000000000000000000000000000000000069,1`
This will step through execution of the mint function within your ERC721 huff contract with the args address=0x0000000000000000000000000000000000000069 and amount=1.

### Options
**--state**
When debugging you may have a transaction that relys on some existing contract state. A typical example of this would be calling a function with some form of access protection, the most common of these is the onlyOwner modifier for calling sensitive functions. Debugging these calls will ALWAYS fail is you have not provided the state flag as the OWNER will be set to the zero address. Making any future logic unaccessible. Providing the state flag will persist any storage updates that are made. 
State is stored as a git repository within the cache folder - see the [hevm docs](https://github.com/dapphub/dapptools/blob/master/src/hevm/README.md#hevm-exec) for more information.

**--reset**
This flag provides a fresh hevm state, read above for more info on state.



# Contributors
Below is only relevant if you are reading this to contribute to the project!
For any feature requests please open a github issue, if you want to get your hands dirty feel free to pull and create a pull request!! 

## Installation

To start working on your project, just run

```bash
npm install
```

## Plugin development

Make sure to read our [Plugin Development Guide](https://hardhat.org/advanced/building-plugins.html) to learn how to build a plugin.

## Testing

Running `npm run test` will run every test located in the `test/` folder. They
use [mocha](https://mochajs.org) and [chai](https://www.chaijs.com/),
but you can customize them.

We recommend creating unit tests for your own modules, and integration tests for
the interaction of the plugin with Hardhat and its dependencies.

## Linting and autoformat

All of Hardhat projects use [prettier](https://prettier.io/) and
[tslint](https://palantir.github.io/tslint/).

You can check if your code style is correct by running `npm run lint`, and fix
it with `npm run lint:fix`.

## Building the project

Just run `npm run build` ️👷
