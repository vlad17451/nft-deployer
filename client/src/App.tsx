import { ethers } from "ethers";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import styled from "styled-components";

const Container = styled.div`
  padding: 20px;
`;

const Box = styled.div`
  padding: 20px 30px;
  border: 1px solid #ccc;
  margin: 0 0 30px;
  min-height: 220px;
`

const Sides = styled.div`
  display: grid;
  align-items: flex-start;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
`;

const Side = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`

const Input = styled.input`
  height: 22px;
  margin: 0;
  padding: 0;
  max-width: 200px;
`

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const CollectionItem = styled.div`
  display: flex;
  justify-content: space-between; 
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px 0;
  align-items: center;
`

const CollectionMeta = styled.div`
  display: grid;
  grid-gap: 5px;
`

const Reload = styled.button`
  width: 70px;
  margin: 0 0 0 15px;
`

const Button = styled.button`
  width: 140px;
  height: 24px;
`

const baseUri = 'http://localhost:5001' // TODO move to env

const fetchHubAddress = async (chainId: bigint) => {
  const res = await fetch(`${baseUri}/api/hub-address/${chainId}`)
    .then(res => res.json())
    .catch(e => {
      console.log(e);
      
    })
  return res.hubAddress;
}

const fetchAbis = async () => {
  const res = await fetch(`${baseUri}/api/abi`).then(res => res.json());
  return res;
}

const fetchCollection = async () => {
  const res = await fetch(`${baseUri}/api/collections`).then(res => res.json());
  return res;
}

const getProvider = async () => {
  const _window = window as any;
  await _window.ethereum.enable()
  const provider = new ethers.BrowserProvider(_window.ethereum);
  return provider;
}

const createCollection = async (name: string, symbol: string) => {
  const provider = await getProvider();
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();
  const chainId = network.chainId;
  const hubAddress = await fetchHubAddress(chainId);
  const { hub: hubAbi } = await fetchAbis();
  const hub = new ethers.Contract(hubAddress, hubAbi, signer);
  await hub.createCollection(name, symbol)
    .then(tx => tx.wait())
    .catch(e => {
      console.error(e);
    })
}

const mintNFT = async (collection: string, tokenUri: string) => {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const network = await provider.getNetwork();
    const chainId = network.chainId;
    const hubAddress = await fetchHubAddress(chainId);
    const { hub: hubAbi } = await fetchAbis();
    const hub = new ethers.Contract(hubAddress, hubAbi, signer);
    await hub.mintNFT(
      collection,
      signer.address,
      tokenUri
    )
      .then(tx => tx.wait())
      .catch(e => {
        console.error(e);
      })
}

export default function Index() {

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [tokenUri, setTokenUri] = useState('');
  const [collections, setCollections] = useState([]);

  const [selectedCollection, setSelectedCollection] = useState(null);

  const updateCollections = useCallback(async () => {
    const res = await fetchCollection()
    if (res.collections) {
      setCollections(res.collections);
    }
  }, [])

  useEffect(() => {
    updateCollections()
  }, [updateCollections]);

  useEffect(() => {

    const interval = setInterval(() => {
      updateCollections()
    }, 3000)
    return () => clearInterval(interval);
  })

  const handleMint = () => {
    if (!selectedCollection || !tokenUri) {
      return;
    }
    mintNFT(selectedCollection, tokenUri)
  }

  const collectionTokens = useMemo(() => {
    if (!selectedCollection) {
      return [];
    }
    const collection: any = collections.find((c: any) => c.collectionAddress === selectedCollection);
    return collection?.tokens || [];
  }, [selectedCollection, collections])

  return (
    <Container>  
      <h2>
        <span>NFT Hub</span>
        <Reload onClick={() => updateCollections()}>
          Reload
        </Reload>
      </h2>
      <Sides>
        <Side>
          <Box>
            <Form>
              <h2>Create collection</h2>
              <Input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input type="text" placeholder="Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
              <Button onClick={() => createCollection(name, symbol)}>
                Create
              </Button>
            </Form>
          </Box>
          <Box>
            <h2>Collections</h2>
            {collections.length === 0 && (
              <div>
                No collections yet, create one
              </div>
            )}
            {collections.map((collection: any) => (
              <CollectionItem key={collection.id}>
                <CollectionMeta>
                  <div>
                    Name: {collection.name} 
                  </div>
                  <div>
                    Symbol: {collection.symbol}
                  </div>
                  <div>
                    Address: {collection.collectionAddress}
                  </div>
                </CollectionMeta>
                <div>
                  <Button onClick={() => setSelectedCollection(collection.collectionAddress)}>
                    Select
                  </Button> 
                </div>
              </CollectionItem>
            ))}
          </Box>
        </Side>
        <Side>
        {
          selectedCollection && (
            <>
              <Box>
                <h2>Mint NFT</h2>
                <h4>
                  Selected collection: {selectedCollection}
                </h4>
                <Form>
                  <Input type="text" placeholder="Token Uri" value={tokenUri} onChange={(e) => setTokenUri(e.target.value)} />
                  <Button onClick={() => handleMint()}>
                    Mint NFT
                  </Button>
                </Form>
              </Box>
              {
                collectionTokens.length > 0 && (
                  <Box>
                    <h2>
                      Tokens
                    </h2>
                    {collectionTokens.map((token: any) => (
                      <CollectionItem key={token.id}>
                        <CollectionMeta>
                          <div>
                            Token id: {token.tokenId} 
                          </div>
                          <div>
                            Token Uri: {token.tokenUri}
                          </div>
                          <div>
                            Owner: - {/* TODO */}
                          </div>
                        </CollectionMeta>
                      </CollectionItem>
                    ))}
                  </Box>
                )
              }
            </>
          )
        }
        </Side>
      </Sides>
    </Container>
  );
}
