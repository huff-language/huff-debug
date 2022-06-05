import { execSync } from "child_process";
import { NomicLabsHardhatPluginError } from "hardhat/plugins";
import { Artifacts, HardhatConfig, HardhatRuntimeEnvironment, HardhatUserConfig, ProjectPathsConfig } from "hardhat/types";
import fs from "fs";

// This import is needed to let the TypeScript compiler know that it should include your type
// extensions in your npm package's types file.
import { PLUGIN_NAME } from "./constants";
import { CommandFlags, HevmOptions } from "./types";
import { getArtifact, getFiles } from "./utils";


/**Debug
 * 
 * Runs a function within a given file with provided args
 * 
 * @param file FilePath of target file - provided by user 
 * @param func Human readable target function name - provided by user
 * @param args Comma separated list of inputs - provided by user 
 * @param flags Flags set by the user
 * @param paths 
 * @param artifacts 
 * @param ethers 
 */
export async function debug(
  file: string, 
  func: string, 
  args: string, 
  flags: CommandFlags,
  paths: ProjectPathsConfig, 
  ethers: any // where tf is this type
){ 
  // TODO: sanitizeConfig()
  const config: HevmOptions = {
    // Create deterministic deployment address for each contract
    hevmContractAddress: ethers.utils.keccak256(Buffer.from(file)).toString().slice(0,42),
    hevmCaller: "0x0000000000000000000000000000000000000069",
    statePath: "cache/huff_debug_hevm_state"
  }

  // Get all files with .huff extension from the project
  const artifactPath = (await getArtifact(paths, file)).find(fil => fil.includes(file));
  if (!artifactPath) throw new NomicLabsHardhatPluginError(PLUGIN_NAME, "Named file not found");
    
  // get compiler artifact
  const artifact =  fs.readFileSync(artifactPath, "utf-8")
  const {abi, bytecode, deployedBytecode} = JSON.parse(artifact);

  // Get contract and encoded transaction
  const contract = new ethers.Contract(config.hevmContractAddress, abi);
  const tx = await contract.populateTransaction[func](...args.split(","));

  // Perform necessary configuration for state support
  if (flags.state) {

    // Create state repo 
    if (!fs.existsSync(config.statePath)){ 
      resetStateRepo(config.statePath)

      // Execute constructor logic
      deployContract(bytecode, config)
    }
  } 

  // Run interactive debugger
  runDebugger(deployedBytecode, tx.data, flags, config);
}

/**Deploy Contract
 * 
 * If the state flag is set then the contract must first be deployed in order to execute constructor logic
 */
const deployContract = (bytecode: string, config: HevmOptions) => {
  const command = `hevm exec
  --code 0x${bytecode} \
  --address ${config.hevmContractAddress} \
  --create \
  --caller ${config.hevmCaller} \
  --gas 0xffffffff \
  --state ${config.statePath}
  `
  // cache command
  fs.writeFileSync("cache/hevmtemp", command);
  
  // execute command
  execSync("`cat cache/hevmtemp`")
}

const runDebugger = (bytecode: string, calldata: string, flags:CommandFlags, config: HevmOptions) => {
  console.log("Entering debugger...")

  if (flags){
      if (flags.reset){
          resetStateRepo(config.statePath)
      }
  }
  
    // Command
  const command = `hevm exec \
  --code 0x${bytecode} \
  --address ${config.hevmContractAddress} \
  --caller ${config.hevmCaller} \
  --gas 0xffffffff \
  ${(flags.state) ? ("--state "+ config.statePath)  : ""} \
  --debug \
  --calldata ${calldata}`
  
  // command is cached into a file as execSync has a limit on the command size that it can execute
  fs.writeFileSync("cache/hevmtemp", command);
 
  // run the debugger
  execSync("`cat cache/hevmtemp`", {stdio: ["inherit", "inherit", "inherit"]})
}


/**Reset state repo
 * 
 * Hevm state is stored within a local git repository, to reset the state 
 * we must delete the repository then init a new one.
 * 
 * TODO: Windows compatibility
 * @param statePath 
 */
const resetStateRepo = (statePath: string) => {
    console.log("Creating state repository...")

    const removeStateCommand = `rm -rf ${statePath}`;
    const createStateRepository = `mkdir ${statePath}`;
    const initStateRepositoryCommand = `cd ${statePath} && git init && git commit --allow-empty -m "init" && cd ..`;

    execSync(removeStateCommand)
    execSync(createStateRepository)
    execSync(initStateRepositoryCommand)
    console.log("Created state repository...")
}