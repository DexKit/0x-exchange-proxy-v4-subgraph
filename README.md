# 0x Exchange Proxy Subgraph (In Progress)

This is a community-run subgraph for the 0x Exchange proxy supporting all current networks from the 0x protocol. At its current state, it aims to support the following networks: ETH, Optimism, BSC, Polygon, Arbitrum, Fantom, Avalanche, Base, and Celo.

This is an extended fork from [https://github.com/0xProject/ep-subgraph].

If you are looking for a graph more focused on NFT trading look at this repo [https://github.com/DexKit/0x-nft-v4-subgraph].

Added:

- ERC721 NFT fills
- ERC1155 NFT fills
- PancakeSwap call
- NFT fill counters for maker and taker
- OTC order
- OTC fill counters for maker and taker

# Getting Started

- Start by installing dependencies.

```bash
yarn
```

- Generate code for subgraph

```bash
 yarn codegen
```

- Build subgraph for a specific network

```bash
yarn build --network <network>
```

where <network> represents the supported subgraph networks: mainnet, optimism, bsc, matic, fantom, avalanche, base, arbitrum-one, celo.

# How to deploy subgraph

## Hosted Service

For any network supported by the protocol,

```bash

source .env; yarn codegen; yarn build --network <network>; yarn deploy --product hosted-service dexkit/0x-exchange-proxy-v4 --access-token $ACCESS_TOKEN

```

replace <network> with the target network.

For instance, for Ethereum network:

```bash

source .env; yarn codegen; yarn build --network mainnet; yarn deploy --product hosted-service dexkit/0x-exchange-proxy-v4--access-token $ACCESS_TOKEN

```

# Subgraph Deployments (TODO)

## Mainnet

## Optimism

## BSC

## Polygon

## Fantom

## Avalanche

## Base

## Celo

## Adding a new Network

To add a new network to this graph, fill in networks.json with the respective exchange proxy address and start blocks. Next, in src/constants/network, add the network to the namespace and fill in addresses for WETH, EXCHANGE_PROXY, FLASH_WALLET, SANDBOX, and FACTORIES if applicable.

Use as source these up-to-date list of [addresses](https://github.com/0xProject/protocol/blob/development/packages/contract-addresses/addresses.json)

## TODO

- Deployments
- More documentation

# References

[0x Exchange Proxy ABI](https://github.com/0xProject/protocol/blob/development/packages/contract-artifacts/artifacts/IZeroEx.json)

[0x Addresses Source](https://github.com/0xProject/protocol/blob/development/packages/contract-addresses/addresses.json)
