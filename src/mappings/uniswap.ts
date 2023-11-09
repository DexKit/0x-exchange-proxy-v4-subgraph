import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Fill, Token } from '../../generated/schema';
import { Swap } from '../../generated/Uniswap/UniswapPair';

import { takerFindOrCreate, transactionFindOrCreate } from '../utils';
import { GET_EXCHANGE_PROXY_ADDRESS } from '../constants/network';
import { getPairInfo } from '../utils/uniswap';



export function handleUniswapSwap(event: Swap): void {
    // We're only interested in ones from the EP because those are from
    // `sellToUniswap()`.
    if (event.params.sender != GET_EXCHANGE_PROXY_ADDRESS()) {
        return;
    }

    let tx = transactionFindOrCreate(event.transaction.hash, event.block);
    let taker = takerFindOrCreate(event.params.to); // sus

    let info = getPairInfo(event.address);
    if (!info.isValid()) {
        return;
    }

    let inputToken: Token;
    let outputToken: Token;
    let inputTokenAmount: BigInt;
    let outputTokenAmount: BigInt;
    if (event.params.amount1In.isZero()) {
        inputToken = info.token0 as Token;
        outputToken = info.token1 as Token;
        inputTokenAmount = event.params.amount0In as BigInt;
        outputTokenAmount = event.params.amount1Out as BigInt;
    } else {
        inputToken = info.token1 as Token;
        outputToken = info.token0 as Token;
        inputTokenAmount = event.params.amount1In as BigInt;
        outputTokenAmount = event.params.amount0Out as BigInt;
    }

    let source = info.source as string;

    let fill = new Fill(tx.id + '-' + source + '-' + event.logIndex.toString());
    fill.blockNumber = tx.blockNumber;
    fill.transaction = tx.id;
    fill.timestamp = tx.timestamp;
    fill.logIndex = event.logIndex;
    fill.source = source;
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

