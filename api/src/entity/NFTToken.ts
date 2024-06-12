import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from "typeorm";
import { NFTCollection } from "./NFTCollection";

@Entity()
@Unique(["collectionAddress", "tokenId"])
export class NFTToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tokenId: string;

  @Column()
  tokenUri: string;

  @Column({ name: "collectionAddress" })
  collectionAddress: string;

  @ManyToOne(() => NFTCollection)
  @JoinColumn({ name: "collectionAddress", referencedColumnName: "collectionAddress" })
  collection: NFTCollection;

  // TODO store owner from collection.ownerOf(tokenId)
}