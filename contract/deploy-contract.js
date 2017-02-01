/**
 * Created by michbil on 15.09.15.
 */


import WebGold from "../src/server/ethereum/ethereum.js";
import fs from 'fs';
import {db as dbMod} from '../src/server/common';var init = dbMod.init;
import {dumpError} from '../src/server/common/utils/utils.js';
import solc from 'solc';



class WebGoldDeploy extends WebGold {




    async compileDeploy(contractName) {
        try {

            const web3 = this.getWeb3();
            console.log("Compiling...");
            const source = fs.readFileSync(`./src/${contractName}.sol`).toString();
            const [abi,bytecode] = await this.compileContract(source);

            fs.writeFileSync(`./bin/${contractName}.abi`,abi);
            fs.writeFileSync(`./bin/${contractName}.binary`,bytecode);
            console.log("Deploying...");
            this.unlockMaster();
            const contraddr = await this.deploy("0x740f63f535bc86fb87f9482adbec5ca289a2d59e", bytecode,JSON.parse(abi));
            this.saveContractAddress(contraddr,`./bin/${contractName}.addr`);


        } catch(e) {
            console.log(e);
        }
    }

    saveContractAddress(addr,solfile) {
        fs.writeFileSync(solfile,addr);
    }

}
try {
    (async () =>{
        var db = await init();
        console.log("Db ready");
        var depl = new WebGoldDeploy(db);
        console.log("Starting deploy process");
        await depl.compileDeploy('THX');
        //depl.compile('./src/webgold.sol');
        //depl.deploy('./bin/token.addr');

        //depl.compile('./src/webgold.sol');
        //depl.deploy('./bin/token.addr');
    })();

}
catch (e) {
    dumpError(e);
}
