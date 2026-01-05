import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("ContribNFT", function () {
    async function deployFixture() {
        const [owner, minter, user] = await ethers.getSigners();

        // Deploy contract
        const ContribNFT = await ethers.getContractFactory("ContribNFT");
        // Grant admin role to owner
        const contract = await ContribNFT.deploy(owner.address);
        await contract.waitForDeployment();

        // Grant MINTER_ROLE to minter address (simulating the backend)
        const MINTER_ROLE = await contract.MINTER_ROLE();
        await contract.grantRole(MINTER_ROLE, minter.address);

        return { contract, owner, minter, user, MINTER_ROLE };
    }

    describe("Deployment", function () {
        it("Should set the right admin", async function () {
            const { contract, owner } = await loadFixture(deployFixture);
            const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
            expect(await contract.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.equal(true);
        });
    });

    describe("Lazy Minting", function () {
        it("Should redeem a valid voucher", async function () {
            const { contract, minter, user } = await loadFixture(deployFixture);

            const domain = {
                name: "ContribMint",
                version: "1",
                chainId: 1337,
                verifyingContract: await contract.getAddress(),
            };

            const types = {
                Voucher: [
                    { name: "projectId", type: "string" },
                    { name: "prId", type: "string" },
                    { name: "metadataUri", type: "string" },
                    { name: "minter", type: "address" },
                ],
            };

            const voucher = {
                projectId: "proj_123",
                prId: "pr_456",
                metadataUri: "ipfs://QmTest",
                minter: user.address,
            };

            const signature = await minter.signTypedData(domain, types, voucher);

            await expect(contract.connect(user).redeem(voucher, signature))
                .to.emit(contract, "ContribMinted")
                .withArgs(user.address, 0, "proj_123", "pr_456");

            expect(await contract.ownerOf(0)).to.equal(user.address);
            expect(await contract.tokenURI(0)).to.equal("ipfs://QmTest");
        });

        it("Should fail if signature is invalid", async function () {
            const { contract, minter, user, owner } = await loadFixture(deployFixture);

            const domain = {
                name: "ContribMint",
                version: "1",
                chainId: 1337,
                verifyingContract: await contract.getAddress(),
            };

            const types = {
                Voucher: [
                    { name: "projectId", type: "string" },
                    { name: "prId", type: "string" },
                    { name: "metadataUri", type: "string" },
                    { name: "minter", type: "address" },
                ],
            };

            const voucher = {
                projectId: "proj_123",
                prId: "pr_456",
                metadataUri: "ipfs://QmTest",
                minter: user.address,
            };

            // Sign with WRONG account (user does not have MINTER_ROLE)
            const signature = await user.signTypedData(domain, types, voucher);

            await expect(contract.connect(user).redeem(voucher, signature))
                .to.revertedWith("Invalid signature or unauthorized signer");
        });
    });
});
