// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {FarawayNFT} from "./FarawayNFT.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

contract FarawayHub {
    event CollectionCreated(address collection, string name, string symbol);
    event TokenMinted(
        address collection,
        address recipient,
        uint256 tokenId,
        string tokenUri
    );

    address public immutable NFT_IMPL;

    constructor(address initialNftImpl) {
        NFT_IMPL = initialNftImpl;
    }

    function createCollection(
        string memory name,
        string memory symbol
    ) external {
        address collection = Clones.clone(NFT_IMPL);
        FarawayNFT(collection).initialize(address(this), name, symbol);
        emit CollectionCreated(collection, name, symbol);
    }

    function mintNFT(
        FarawayNFT collection,
        address to,
        string memory tokenUri
    ) external {
        uint256 tokenId = collection.safeMint(msg.sender, tokenUri);
        emit TokenMinted(address(collection), to, tokenId, tokenUri);
    }
}
