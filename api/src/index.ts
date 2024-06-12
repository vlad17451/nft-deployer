import "reflect-metadata"

import { json, urlencoded } from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";

import "./listener"
import { getHubAbi, getHubAddress } from "./utils";
import { HubDataSource } from "./dataSource";
import { NFTCollection } from "./entity/NFTCollection";
import { listenToHubContractEvents } from "./listener";

export const createServer = (): Express => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors())

  return app;
};

const port = process.env.PORT || 5001;
const server = createServer();

server.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});

HubDataSource.initialize()
    .then(() => {
        console.log('Database initialized');
        listenToHubContractEvents()
    })
    .catch((error) => console.log(error))

server.get("/api/hub-address/:chainId", async (req, res) => {
  const { chainId } = req.params;
  const hubAddress = await getHubAddress(Number(chainId));
  if (!hubAddress) {
    return res.status(404).json({ message: `Hub address not found for chainId ${chainId}` });
  }
  return res.status(200).json({ hubAddress });
})


server.get("/api/abi", async (req, res) => {
  return res.json({ 
    hub: await getHubAbi(),
    nft: []
  });
})

server.get("/api/collections", async (req, res) => {
  const collectionRepository = HubDataSource.getRepository(NFTCollection);
  const collections = await collectionRepository.find({ relations: ["tokens"] });
  return res.status(200).json({
    collections
  });
})

