import { execSync } from "child_process";
import { NomicLabsHardhatPluginError } from "hardhat/plugins";
import { Artifacts, HardhatConfig, HardhatRuntimeEnvironment, HardhatUserConfig, ProjectPathsConfig } from "hardhat/types";
import fs from "fs";

// This import is needed to let the TypeScript compiler know that it should include your type
// extensions in your npm package's types file.
import "./type-extensions";
import { PLUGIN_NAME } from "./constants";
import { CommandFlags, HevmOptions } from "./types";
import { getFiles } from "./utils";


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
  artifacts: Artifacts, 
  ethers: any // where tf is this type
){ 
  // TODO: sanitizeConfig()
  const config: HevmOptions = {
    hevmContractAddress: "0x0000000000000000000000000000000000000420",
    hevmCaller: "0x0000000000000000000000000000000000000069",
    statePath: "cache/huff_debug_hevm_state"
  }

  // Get all files with .huff extension from the project
  const huffFiles = await getFiles(paths);

  // Find provided [file] argument
  let target = huffFiles.find((hf: string) : boolean => {
      if (hf) return hf.includes(file)
      return false
    })

  // TODO: syntactic abomination
  if (target) target = target.replace(__dirname,"")
  else throw new NomicLabsHardhatPluginError(PLUGIN_NAME, "Named file not found");
    
  // get compiler artifact
  const artifact =  fs.readFileSync(`${paths.artifacts}/${target}/${file}.json`, "utf-8")
  const {abi, deployedBytecode} = JSON.parse(artifact);

  // Get contract and encoded transaction
  const contract = new ethers.Contract(config.hevmContractAddress, abi);
  const tx = await contract.populateTransaction[func](...args.split(","));

  runDebugger(deployedBytecode, tx.data, flags, config);
}


const runDebugger = (bytecode: string, calldata: string, flags:CommandFlags, config: HevmOptions) => {
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
  ${(flags.state) ? ("--state "+ config.statePath + " \\")  : ""}
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
    const removeStateCommand = `rm -rf ${statePath}`;
    const createStateRepository = `mkdir ${statePath}`;
    const initStateRepositoryCommand = `cd ${statePath} && git init && git commit --allow-empty -m "init" && cd ..`;

    execSync(removeStateCommand)
    execSync(createStateRepository)
    execSync(initStateRepositoryCommand)
}