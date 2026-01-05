import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const ContribNFT = await ethers.getContractFactory("ContribNFT");
    const contribNFT = await ContribNFT.deploy(deployer.address);

    await contribNFT.waitForDeployment();

    console.log("ContribNFT deployed to:", await contribNFT.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
