import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import {EventLog} from "ethers";
import { FarawayNFT } from "../typechain-types";

describe.only("Nft", function () {
  async function deployFixture() {
    
    const signers = await hre.ethers.getSigners();

    const FarawayNFT = await hre.ethers.getContractFactory("FarawayNFT");
    const FarawayHub = await hre.ethers.getContractFactory("FarawayHub");

    const farawayNFTImpl = await FarawayNFT.deploy()

    const farawayHub = await FarawayHub.deploy(await farawayNFTImpl.getAddress());

    return { farawayHub, signers, FarawayNFT };
  }

  describe("Deployment", function () {
    it("Should create nft and emit event", async function () {
      const { farawayHub, FarawayNFT, signers } = await loadFixture(deployFixture);

      const receipt = await farawayHub.createCollection("QWEqwe", "q").then((tx) => tx.wait());
      const receiptLogs = receipt?.logs ?? [];
      
      const log = receiptLogs[receiptLogs.length - 1] as EventLog
      const nftAddress = log?.args[0]
      const name = log?.args[1]
      const symbol = log?.args[2]
      expect(name).to.equal("QWEqwe")
      expect(symbol).to.equal("q")

      const nft = FarawayNFT.attach(nftAddress) as FarawayNFT
      expect(await nft.name()).to.equal("QWEqwe")
      expect(await nft.symbol()).to.equal("q")

      await farawayHub.connect(signers[0]).mintNFT(nftAddress, signers[0].address, "tokenUri").then((tx) => tx.wait());
    });
  });

});
