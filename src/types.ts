export interface HevmOptions{
    hevmContractAddress: string;
    hevmCaller: string;
    statePath: string;
}

export interface CommandFlags{
    state: boolean;
    reset: boolean;
}