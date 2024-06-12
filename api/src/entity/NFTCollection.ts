import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { NFTToken } from "./NFTToken";

@Entity()
export class NFTCollection {
  @PrimaryColumn()
  collectionAddress: string;

  @Column()
  hubAddress: string;

  @Column()
  name: string;

  @Column()
  symbol: string;

  @OneToMany(() => NFTToken, token => token.collection)
  tokens: NFTToken[];
}