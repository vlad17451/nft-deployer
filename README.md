
# Quick start

## 1. Run local blockchain (in separated terminal)

```shell
cd contracts
npm i
npx hardhat node
```

## 1.1 Metamask

Add local network to Metamask and import private key from the hardhat node

local network:

RPC URL - `http://127.0.0.1:8545/`

Chain id - `31337`

## 2. Deploy the contracts
```shell
cd contracts
npx hardhat ignition deploy ignition/modules/FarawayHub.ts --network localhost
cd ..
```

## 3. Run docker
This docker used to run postgress database for backend
```shell
cd docker
sudo docker-compose up -d
cd ..
```

## 4. Run back-end
```shell
cd api
npm i 
npm run dev
```

## 5. Run front-end
```shell
cd client
npm i 
npm start
```