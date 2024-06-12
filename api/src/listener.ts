import "reflect-metadata"
import { ethers } from "ethers";
import { getHubAbi, getHubAddress } from "./utils";
import { NFTCollection } from "./entity/NFTCollection";
import { HubDataSource } from "./dataSource";
import { NFTToken } from "./entity/NFTToken";

// TODO add handling of different chainIds
const chainId = 31337;
const rpcUrl = "http://localhost:8545";

const saveNFTCollection = async (collectionAddress: string, name: string, symbol: string, hubAddress: string) => {
  console.log('Saving collection', hubAddress, collectionAddress, name, symbol);
  const newCollection = new NFTCollection();
  newCollection.name = name;
  newCollection.symbol = symbol;
  newCollection.collectionAddress = collectionAddress;
  newCollection.hubAddress = hubAddress;
  const collectionRepository = HubDataSource.getRepository(NFTCollection);
  await collectionRepository.save(newCollection);
}

const saveNFTToken = async (collectionAddress: string, tokenId: string, tokenUri: string) => {
  console.log('Saving token', collectionAddress, tokenId, tokenUri);
  const tokenRepository = HubDataSource.getRepository(NFTToken);
  
  const collectionRepository = HubDataSource.getRepository(NFTCollection);
  const collection = await collectionRepository.findOne({ where: { collectionAddress } });

  await tokenRepository
    .createQueryBuilder()
    .insert()
    .into(NFTToken)
    .values({
        collectionAddress: collectionAddress,
        tokenId: tokenId,
        tokenUri: tokenUri,
        collection: collection
    })
    .orIgnore()
    .execute();
}

export async function listenToHubContractEvents() {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const [
    hubAddress,
    abi
  ] = await Promise.all([
    getHubAddress(chainId),
    getHubAbi()
  ])
  const hubContract = new ethers.Contract(hubAddress, abi, provider);

  console.log('Listening to events from hub contract:', hubAddress);

  const createCollectionPastEvents = await hubContract.queryFilter(hubContract.filters.CollectionCreated()) as ethers.EventLog[];
  for (const event of createCollectionPastEvents) {
    const [collectionAddress, name, symbol] = event.args;
    saveNFTCollection(
      collectionAddress,
      name,
      symbol,
      hubAddress
    )
  }

  const mintTokenPastEvents = await hubContract.queryFilter(hubContract.filters.TokenMinted()) as ethers.EventLog[];
  for (const event of mintTokenPastEvents) {
    const [collectionAddress, _recipient, tokenId, tokenUri] = event.args;
    saveNFTToken(
      collectionAddress,
      tokenId,
      tokenUri
    )
  }

  // TODO add skipping of already saved events

  hubContract.on("CollectionCreated", async (collectionAddress, name, symbol) => {
    saveNFTCollection(
      collectionAddress,
      name,
      symbol,
      hubAddress
    )
  });

  hubContract.on("TokenMinted", async (collectionAddress, _recipient, tokenId, tokenUri) => {
    saveNFTToken(
      collectionAddress,
      tokenId,
      tokenUri
    )
  })
}