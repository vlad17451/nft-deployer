import fs from 'fs';
import path from 'path';

export const getHubAddress = async (chainId: number) => {
  try {
    const filePath = path.resolve(__dirname, `../../contracts/ignition/deployments/chain-${chainId}/deployed_addresses.json`);
    const fileContent = await fs.promises.readFile(filePath, 'utf8');  
    const hubAddress = JSON.parse(fileContent)['FarawayHubModule#FarawayHub']
    return hubAddress;
  } catch (error) {
    return null;
  }
}
export const getHubAbi = async () => {
  try {
    const filePath = path.resolve(__dirname, `../../contracts/artifacts/contracts/FarawayHub.sol/FarawayHub.json`);
    const fileContent = await fs.promises.readFile(filePath, 'utf8');  
    const { abi } = JSON.parse(fileContent)
    return abi;
  } catch (error) {
    return null;
  }
}