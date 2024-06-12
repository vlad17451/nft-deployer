import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FarawayNFTModule = buildModule("FarawayNFTModule", (m) => {
  const farawayNFT = m.contract("FarawayNFT")
  return { farawayNFT };
});

const FarawayHubModule = buildModule("FarawayHubModule", (m) => {
  const { farawayNFT } = m.useModule(FarawayNFTModule);
  const farawayHub = m.contract("FarawayHub", [farawayNFT]);
  return { farawayHub };
});

export default FarawayHubModule;