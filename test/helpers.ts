import { resetHardhatContext } from "hardhat/plugins-testing";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";
import * as fsExtra from "fs-extra";

declare module "mocha" {
  interface Context {
    hre: HardhatRuntimeEnvironment;
  }
}

export function useFixtureProject(projectName: string) {
  let projectPath: string;
  let prevWorkingDir: string;

  before(() => {
    projectPath = getFixtureProjectPath(projectName);
  });

  before(() => {
    prevWorkingDir = process.cwd();
    process.chdir(projectPath);
  });

  after(() => {
    process.chdir(prevWorkingDir);
  });
}

function getFixtureProjectPath(projectName: string): string {
  const projectPath = path.join(__dirname, "fixture-projects", projectName);

  if (!fsExtra.pathExistsSync(projectPath)) {
    throw new Error(`Fixture project ${projectName} doesn't exist`);
  }

  return fsExtra.realpathSync(projectPath);
}

export function useEnvironment(fixtureProjectName: string) {
  beforeEach("Loading hardhat environment", function () {
    process.chdir(path.join(__dirname, "fixture-projects", fixtureProjectName));

    this.hre = require("hardhat");
  });

  afterEach("Resetting hardhat", function () {
    resetHardhatContext();
  });
}
