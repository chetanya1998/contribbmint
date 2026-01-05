import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
    solidity: "0.8.20",
    networks: {
        hardhat: {
            chainId: 1337,
        },
        // Add testnets here later (e.g. Sepolia, Mumbai)
    },
};

export default config;
