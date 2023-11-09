import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { ERC20 } from '../../generated/ExchangeProxy/ERC20';
import { ERC20SymbolBytes } from '../../generated/ExchangeProxy/ERC20SymbolBytes';
import { IERC721Metadata } from '../../generated/ExchangeProxy/IERC721Metadata';

import { Collection, Fill, Maker, Taker, Token, Transaction } from '../../generated/schema';
import { GET_WETH_ADDRESS } from '../constants/network';




/*Math.seedRandom(1337);

export function getRandomNumber(): number {
    return i32(Math.round(Math.random() * 1e9));
}*/

export function normalizeTokenAddress(token: Address): Address {
    if (token.toHexString() == '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        return GET_WETH_ADDRESS();
    }
    return token;
}

export function fetchTokenSymbol(tokenAddress: Address): string {
    if (tokenAddress.toHexString() == '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        return 'ETH';
    }
    let contract = ERC20.bind(tokenAddress);
    let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress);
    // try types string and bytes32 for symbol
    let symbolValue = 'unknown';
    let symbolResult = contract.try_symbol();
    if (symbolResult.reverted) {
        let symbolResultBytes = contractSymbolBytes.try_symbol();
        if (!symbolResultBytes.reverted) {
            // for broken pairs that have no symbol function exposed
            if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
                symbolValue = symbolResultBytes.value.toString();
            }
        }
    } else {
        symbolValue = symbolResult.value;
    }

    return symbolValue;
}

export function fetchTokenName(tokenAddress: Address): string {
    if (tokenAddress.toHexString() == '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        return 'Ethereum';
    }
    let contract = ERC20.bind(tokenAddress);


    let nameValue = 'unknown';
    let nameResult = contract.try_name();
    if (!nameResult.reverted && nameResult.value) {
        nameValue = nameResult.value;
    }
    return nameValue;
}

export function fetchNftName(tokenAddress: Address): string {
    if (tokenAddress.toHexString() == '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        return 'Ethereum';
    }
    let contract = IERC721Metadata.bind(tokenAddress);
    let nameValue = 'unknown';
    let nameResult = contract.try_name();
    if (!nameResult.reverted && nameResult.value) {
        nameValue = nameResult.value;
    }
    return nameValue;
}

export function fetchNftURI(tokenAddress: Address, id: BigInt): string {
    if (tokenAddress.toHexString() == '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        return '';
    }
    let contract = IERC721Metadata.bind(tokenAddress);
    let tokenURIValue = '';
    let tokenURIResult = contract.try_tokenURI(id);
    if (!tokenURIResult.reverted && tokenURIResult.value) {
        tokenURIValue = tokenURIResult.value;
    }
    return tokenURIValue;
}




export function fetchTokenDecimals(tokenAddress: Address): BigInt {
    if (tokenAddress.toHexString() == '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        return BigInt.fromI32(18);
    }
    let contract = ERC20.bind(tokenAddress);
    // try types uint8 for decimals
    let decimalValue = null;
    let decimalResult = contract.try_decimals();
    if (!decimalResult.reverted) {
        decimalValue = decimalResult.value;
    }
    return BigInt.fromI32(decimalValue as i32);
}

// https://github.com/Uniswap/uniswap-v2-subgraph/blob/master/src/mappings/helpers.ts
export function isNullEthValue(value: string): boolean {
    return value == '0x0000000000000000000000000000000000000000000000000000000000000001';
}

export function transactionFindOrCreate(txHash: Bytes, block: ethereum.Block): Transaction {
    let tx = Transaction.load(txHash.toHexString());
    if (!tx) {
        tx = new Transaction(txHash.toHexString());
        tx.timestamp = block.timestamp;
        tx.blockNumber = block.number;
        tx.fills = [];
        tx.save();
    }
    return tx!;
}

export function tokenFindOrCreate(address: Address): Token {
    let token = Token.load(normalizeTokenAddress(address).toHexString());
    if (!token) {
        token = new Token(address.toHexString());
        token.symbol = fetchTokenSymbol(address);
        token.decimals = fetchTokenDecimals(address);
        token.rfqOrderVolume = BigInt.fromI32(0);
        token.limitOrderVolume = BigInt.fromI32(0);
        token.otcOrderVolume = BigInt.fromI32(0);
        token.swapVolume = BigInt.fromI32(0);
        token.type = 'ERC20';
        token.save();
    }
    return token!;
}

export function nftFindOrCreate(address: Address, nftId: BigInt, isERC1155: boolean): Token {
    let token = Token.load(`${normalizeTokenAddress(address).toHexString()}-${nftId.toString()}`);
    if (!token) {
        token = new Token(`${normalizeTokenAddress(address).toHexString()}-${nftId.toString()}`);
        let collection = Collection.load(normalizeTokenAddress(address).toHexString());
        if (!collection) {
            collection = new Collection(normalizeTokenAddress(address).toHexString());
            collection.symbol = fetchTokenSymbol(address);
            collection.type = isERC1155 ? 'ERC1155' : 'ERC721';
            collection.name = fetchNftName(address);
            collection.save();
        }
        token.nftId = nftId;
        token.collection = collection.id;
        token.symbol = fetchTokenSymbol(address);
        token.decimals = fetchTokenDecimals(address);
        token.rfqOrderVolume = BigInt.fromI32(0);
        token.limitOrderVolume = BigInt.fromI32(0);
        token.otcOrderVolume = BigInt.fromI32(0);
        token.tokenURI = fetchNftURI(address, nftId);
        token.swapVolume = BigInt.fromI32(0);
        token.type = isERC1155 ? 'ERC1155' : 'ERC721';
        token.save();
    }
    return token!;
}

export function takerFindOrCreate(address: Address): Taker {
    let taker = Taker.load(address.toHexString());
    if (!taker) {
        taker = new Taker(address.toHexString());
        taker.swapCount = BigInt.fromI32(0);
        taker.nativeOrderFillCount = BigInt.fromI32(0);
        taker.erc1155OrderFillCount = BigInt.fromI32(0);
        taker.erc721OrderFillCount = BigInt.fromI32(0);
        taker.save();
    }
    return taker!;
}

export function makerFindOrCreate(address: Address): Maker {
    let maker = Maker.load(address.toHexString());
    if (!maker) {
        maker = new Maker(address.toHexString());
        maker.nativeOrderFillCount = BigInt.fromI32(0);
        maker.erc1155OrderFillCount = BigInt.fromI32(0);
        maker.erc721OrderFillCount = BigInt.fromI32(0);
        maker.save();
    }
    return maker!;
}

// Why are templates (and therefore .map()) unable to compile?
export function fillsToIds(fills: Fill[]): string[] {
    let r = [] as string[];
    for (let i = 0; i < fills.length; ++i) {
        r.push(fills[i].id);
    }
    return r;
}

export function bytes32ToString(b: Bytes): string {
    let chars = [] as string[];
    for (let i = 0; i < b.length; ++i) {
        if (b[i] === 0) {
            break;
        }
        chars.push(String.fromCharCode(b[i]));
    }
    return chars.join('');
}

