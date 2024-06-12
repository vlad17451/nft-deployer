import { DataSource } from "typeorm";
import { NFTCollection } from "./entity/NFTCollection";
import { NFTToken } from "./entity/NFTToken";

// TODO move to .env
export const HubDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "root",
  password: "admin",
  database: "hub",
  entities: [NFTCollection, NFTToken],
  synchronize: true,
  logging: false,
})