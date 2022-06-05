import commandExists from "command-exists";
import { glob } from "glob";
import path from "path";
import { NomicLabsHardhatPluginError } from "hardhat/plugins";
import { PLUGIN_NAME } from "./constants";
import { ProjectPathsConfig } from "hardhat/types";


/**Check Hevm Installation
 * 
 * Uses command-exists package to check for hevm installation
 * throw error if not found
 */
export const checkHevmInstallation = async () => {
    try{
        await commandExists("hevm");
        return true;
    } catch (e){
        throw new NomicLabsHardhatPluginError(
            PLUGIN_NAME, 
            "Hevm installation required - install here: https://github.com/dapphub/dapptools#installation"
        )
    }
}


/** Get an array of all files */
export const getFiles = async (paths: ProjectPathsConfig) => {
    // Return an array of all Huff files.
    return glob.sync(path.join(paths.sources, "**", "*.huff"));
  };
  
export const getArtifact = async (
    paths: ProjectPathsConfig, 
    fileName: string
) => {
    return glob.sync(path.join(paths.artifacts, "**", `${fileName}.json`))
}
  