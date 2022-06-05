// Hardhat imports
import { task } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";

// Package imports
import { debug } from "./debug";
import { checkHevmInstallation } from "./utils";


task("huff-debug")
  .setDescription("Run a function within a huff file against the hevm debugger")

  // Positional Parameters [file] [func] [args]
  .addPositionalParam("file", "The name of the target file - NOTE: full file extension required")
  .addPositionalParam("func", "The interface function name - E.g: balanceOf, transferFrom - this function must be defined at the top of your huff files")
  .addPositionalParam("args", "Comma separated args, e.g. for (address,uint256) -> 0x0000000000000000000000000000000000000069,1")
  
  // Optional Parameters - Defining hevm state - not implemented yet
  .addFlag("state", "Use persisted hevm state")
  .addFlag("reset", "Reset persisted hevm state")
  
  .setAction(async ({file, func, args, state, reset}, { run, config, ethers }) => {
    // check hevm installation 
    await checkHevmInstallation()

    // Compile huff contracts
    await run("compile");

    // Init hevm debugger
    await debug(file, func, args, {state, reset}, config.paths, ethers);
});
