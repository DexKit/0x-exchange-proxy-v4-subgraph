import { Address, BigInt, Bytes, log } from '@graphprotocol/graph-ts';
import { Fill, Token } from '../../generated/schema';
import { Swap } from '../../generated/UniswapV3/UniswapV3Pool';

import { takerFindOrCreate, transactionFindOrCreate } from '../utils';
import { GET_EXCHANGE_PROXY_ADDRESS } from '../constants/network';
import { getPoolInfo } from '../utils/uniswapv3';


let ZERO = BigInt.fromI32(0);

export function handleUniswapV3Swap(event: Swap): void {
    // We're only interested in ones from the EP because those are from
    // `sellToUniswap()`.
    if (event.params.sender != GET_EXCHANGE_PROXY_ADDRESS()) {
        return;
    }

    let tx = transactionFindOrCreate(event.transaction.hash, event.block);
    let taker = takerFindOrCreate(event.params.recipient); // sus

    let info = getPoolInfo(event.address);
    if (!info.isValid()) {
        return;
    }

    let inputToken: Token;
    let outputToken: Token;
    let inputTokenAmount: BigInt;
    let outputTokenAmount: BigInt;
    if (event.params.amount0.gt(ZERO)) {
        inputToken = info.token0 as Token;
        outputToken = info.token1 as Token;
        inputTokenAmount = event.params.amount0 as BigInt;
        outputTokenAmount = event.params.amount1.neg() as BigInt;
    } else {
        inputToken = info.token1 as Token;
        outputToken = info.token0 as Token;
        inputTokenAmount = event.params.amount1 as BigInt;
        outputTokenAmount = event.params.amount0.neg() as BigInt;
    }

    let fill = new Fill(tx.id + '-UniswapV3-' + event.logIndex.toString());
    fill.blockNumber = tx.blockNumber;
    fill.transaction = tx.id;
    fill.timestamp = tx.timestamp;
    fill.logIndex = event.logIndex;
    fill.source = 'UniswapV3';
    fill.recipient = Address.fromHexString(taker.id) as Bytes;
    fill.inputToken = inputToken.id;
    fill.outputToken = outputToken.id;
    fill.inputTokenAmount = inputTokenAmount;
    fill.outputTokenAmount = outputTokenAmount;
    fill.sender = event.params.sender;
    fill.provider = event.address;
    fill.save();

    {
        let txFills = tx.fills;
        txFills.push(fill.id);
        tx.fills = txFills;
        tx.save();
    }
}

