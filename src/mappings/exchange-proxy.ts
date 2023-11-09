import { BigInt, Bytes, log } from '@graphprotocol/graph-ts';
import {
    ERC1155OrderFilled,
    ERC721OrderFilled,
    LimitOrderFilled,
    LiquidityProviderSwap,
    OtcOrderFilled,
    RfqOrderFilled,
    SellEthForTokenToUniswapV3Call,
    SellTokenForEthToUniswapV3Call,
    SellTokenForTokenToUniswapV3Call,
    SellToPancakeSwapCall,
    SellToUniswapCall,
    TransformedERC20
} from '../../generated/ExchangeProxy/IZeroEx';
import { ERC1155OrderFill, ERC721OrderFill, Fill, NativeOrderFill, Swap } from '../../generated/schema';

import {
    fillsToIds,
    //getRandomNumber,
    makerFindOrCreate,
    nftFindOrCreate,
    takerFindOrCreate,
    tokenFindOrCreate,
    transactionFindOrCreate,
} from '../utils';
import { GET_EXCHANGE_PROXY_ADDRESS } from '../constants/network';
import { decodeUniswapV3TokenPath, findLiquidityProviderFills, findSellToPancakeEventFills, findSellToUniswapEventFills, findSellToUniswapV3EventFills, findTransformERC20Fills } from '../utils/exchange-proxy';


export function handleTransformedERC20Event(event: TransformedERC20): void {
    log.debug('found transformERC20 swap in tx {}', [event.transaction.hash.toHex()]);
    let tx = transactionFindOrCreate(event.transaction.hash, event.block);
    let taker = takerFindOrCreate(event.params.taker);

    let inputToken = tokenFindOrCreate(event.params.inputToken);
    let outputToken = tokenFindOrCreate(event.params.outputToken);
    inputToken.swapVolume =
        inputToken.swapVolume.plus(event.params.inputTokenAmount);
    outputToken.swapVolume =
        outputToken.swapVolume.plus(event.params.outputTokenAmount);
    inputToken.save();
    outputToken.save();

    let swap = new Swap(tx.id + '-' + event.logIndex.toString());
    swap.transaction = tx.id;
    swap.timestamp = tx.timestamp;
    swap.blockNumber = tx.blockNumber;
    swap.logIndex = event.logIndex;
    swap.method = 'TransformERC20';
    swap.fills = fillsToIds(findTransformERC20Fills(tx, event.logIndex));
    swap.inputToken = inputToken.id;
    swap.outputToken = outputToken.id;
    swap.inputTokenAmount = event.params.inputTokenAmount;
    swap.outputTokenAmount = event.params.outputTokenAmount;
    swap.taker = taker.id;
    swap.save();

    {
        taker.swapCount = taker.swapCount.plus(BigInt.fromI32(1));
        taker.save();
    }

    {
        tx.lastSwap = swap.id;
        tx.save();
    }
}

export function handleERC721OrderFilled(event: ERC721OrderFilled): void {
    log.debug('found erc721 order filled in tx {}', [event.transaction.hash.toHex()]);
    let tx = transactionFindOrCreate(event.transaction.hash, event.block);
    let taker = takerFindOrCreate(event.params.taker);
    let maker = makerFindOrCreate(event.params.taker);

    let erc20Token = tokenFindOrCreate(event.params.erc20Token);
    let erc721Token = nftFindOrCreate(event.params.erc721Token, event.params.erc721TokenId, false);


    let nftFill = new ERC721OrderFill(tx.id + '-' + event.logIndex.toString());
    nftFill.transaction = tx.id;
    nftFill.timestamp = tx.timestamp;
    nftFill.blockNumber = tx.blockNumber;
    nftFill.erc20Token = erc20Token.id;
    nftFill.erc721Token = erc721Token.id;
    nftFill.erc20TokenAmount = event.params.erc20TokenAmount;
    nftFill.tradeDirection = event.params.direction == 0 ? 'Buy' : 'Sell';
    nftFill.nonce = event.params.nonce;
    nftFill.save();

    {
        taker.erc721OrderFillCount = taker.erc721OrderFillCount.plus(BigInt.fromI32(1));
        maker.erc721OrderFillCount = maker.erc721OrderFillCount.plus(BigInt.fromI32(1));
        maker.save();
        taker.save();
    }
    {
        tx.save();
    }
}

export function handleERC1155OrderFilled(event: ERC1155OrderFilled): void {
    log.debug('found erc721 order filled in tx {}', [event.transaction.hash.toHex()]);
    let tx = transactionFindOrCreate(event.transaction.hash, event.block);
    let taker = takerFindOrCreate(event.params.taker);
    let maker = makerFindOrCreate(event.params.taker);

    let erc20Token = tokenFindOrCreate(event.params.erc20Token);
    let erc1155Token = nftFindOrCreate(event.params.erc1155Token, event.params.erc1155TokenId, true);


    let nftFill = new ERC1155OrderFill(tx.id + '-' + event.logIndex.toString());
    nftFill.transaction = tx.id;
    nftFill.timestamp = tx.timestamp;
    nftFill.blockNumber = tx.blockNumber;
    nftFill.erc20Token = erc20Token.id;
    nftFill.erc20TokenAmount = event.params.erc20FillAmount;
    nftFill.erc1155TokenAmount = event.params.erc1155FillAmount;
    nftFill.erc1155Token = erc1155Token.id;
    nftFill.tradeDirection = event.params.direction == 0 ? 'Buy' : 'Sell';
    nftFill.nonce = event.params.nonce;
    nftFill.save();

    {
        taker.erc1155OrderFillCount = taker.erc1155OrderFillCount.plus(BigInt.fromI32(1));
        maker.erc1155OrderFillCount = maker.erc1155OrderFillCount.plus(BigInt.fromI32(1));
        maker.save();
        taker.save();
    }
    {
        tx.save();
    }
}

export function handleSellToLiquidityProviderSwapEvent(event: LiquidityProviderSwap): void {
    log.debug('found sellToLiquidityProvider swap in tx {}', [event.transaction.hash.toHex()]);
    let tx = transactionFindOrCreate(event.transaction.hash, event.block);
    let taker = takerFindOrCreate(event.params.recipient); // sus

    let inputToken = tokenFindOrCreate(event.params.inputToken);
    let outputToken = tokenFindOrCreate(event.params.outputToken);
    inputToken.swapVolume =
        inputToken.swapVolume.plus(event.params.inputTokenAmount);
    outputToken.swapVolume =
        outputToken.swapVolume.plus(event.params.outputTokenAmount);
    inputToken.save();
    outputToken.save();

    // TODO: Capture LP events as fills instead of making a fake one?
    let fills = findLiquidityProviderFills(tx, event.logIndex);
    if (fills.length === 0) {
        // If no fill event was found, create a fake one.
        let fill = new Fill(tx.id + '-' + event.params.provider.toHexString() + '-' + event.logIndex.toString());
        fill.transaction = tx.id;
        fill.timestamp = tx.timestamp;
        fill.blockNumber = tx.blockNumber;
        fill.logIndex = event.logIndex;
        fill.source = 'LiquidityProvider';
        fill.recipient = event.params.recipient as Bytes;
        fill.provider = event.params.provider as Bytes;
        fill.sender = GET_EXCHANGE_PROXY_ADDRESS();
        fill.inputToken = inputToken.id;
        fill.outputToken = outputToken.id;
        fill.inputTokenAmount = event.params.inputTokenAmount;
        fill.outputTokenAmount = event.params.outputTokenAmount;
        fill.save();
        fills = [fill];
        {
            let txFills = tx.fills;
            txFills.push(fill.id);
            tx.fills = txFills;
        }
    }

    let swap = new Swap(tx.id + '-' + event.logIndex.toString());
    swap.transaction = tx.id;
    swap.blockNumber = tx.blockNumber;
    swap.timestamp = tx.timestamp;
    swap.logIndex = event.logIndex;
    swap.method = 'LiquidityProvider';
    swap.fills = fillsToIds(fills);
    swap.inputToken = inputToken.id;
    swap.outputToken = outputToken.id;
    swap.inputTokenAmount = event.params.inputTokenAmount;
    swap.outputTokenAmount = event.params.outputTokenAmount;
    swap.taker = taker.id;
    swap.hint = event.params.provider.toHexString();
    swap.save();

    {
        taker.swapCount = taker.swapCount.plus(BigInt.fromI32(1));
        taker.save();
    }

    {
        tx.lastSwap = swap.id;
        tx.save();
    }
}

export function handleRfqOrderFilledEvent(event: RfqOrderFilled): void {
    let tx = transactionFindOrCreate(event.transaction.hash, event.block);
    let maker = makerFindOrCreate(event.params.maker);
    let taker = takerFindOrCreate(event.params.taker);

    let inputToken = tokenFindOrCreate(event.params.takerToken);
    let outputToken = tokenFindOrCreate(event.params.makerToken);
    inputToken.rfqOrderVolume =
        inputToken.rfqOrderVolume.plus(event.params.takerTokenFilledAmount);
    outputToken.rfqOrderVolume =
        outputToken.rfqOrderVolume.plus(event.params.makerTokenFilledAmount);
    inputToken.save();
    outputToken.save();

    let fill = new Fill(tx.id + event.params.orderHash.toHex() + event.logIndex.toString());
    fill.transaction = tx.id;
    fill.timestamp = tx.timestamp;
    fill.blockNumber = tx.blockNumber;
    fill.logIndex = event.logIndex;
    fill.source = 'RfqOrder';
    fill.recipient = Bytes.fromHexString(taker.id) as Bytes;
    fill.inputToken = inputToken.id;
    fill.outputToken = outputToken.id;
    fill.inputTokenAmount = event.params.takerTokenFilledAmount;
    fill.outputTokenAmount = event.params.makerTokenFilledAmount;
    fill.provider = event.params.maker as Bytes;
    fill.save();

    let nativeFill = new NativeOrderFill(
        tx.id + '-' + event.params.orderHash.toHex() + '-' + event.logIndex.toString(),
    );
    nativeFill.transaction = tx.id;
    nativeFill.timestamp = tx.timestamp;
    nativeFill.blockNumber = tx.blockNumber;
    nativeFill.type = 'RfqOrder';
    nativeFill.orderHash = event.params.orderHash;
    nativeFill.maker = maker.id;
    nativeFill.taker = taker.id;
    nativeFill.inputToken = fill.inputToken;
    nativeFill.outputToken = fill.outputToken;
    nativeFill.inputTokenAmount = fill.inputTokenAmount;
    nativeFill.outputTokenAmount = fill.outputTokenAmount;
    nativeFill.pool = event.params.pool;
    nativeFill.fee = BigInt.fromI32(0);
    nativeFill.save();

    {
        maker.nativeOrderFillCount = maker.nativeOrderFillCount.plus(BigInt.fromI32(1));
        maker.save();
    }

    {
        taker.nativeOrderFillCount = taker.nativeOrderFillCount.plus(BigInt.fromI32(1));
        taker.save();
    }

    {
        let txFills = tx.fills;
        txFills.push(fill.id);
        tx.fills = txFills;
        tx.save();
    }
}

export function handleOtcOrderFilledEvent(event: OtcOrderFilled): void {
    let tx = transactionFindOrCreate(event.transaction.hash, event.block);
    let maker = makerFindOrCreate(event.params.maker);
    let taker = takerFindOrCreate(event.params.taker);

    let inputToken = tokenFindOrCreate(event.params.takerToken);
    let outputToken = tokenFindOrCreate(event.params.makerToken);
    inputToken.otcOrderVolume =
        inputToken.otcOrderVolume.plus(event.params.takerTokenFilledAmount);
    outputToken.otcOrderVolume =
        outputToken.otcOrderVolume.plus(event.params.makerTokenFilledAmount);
    inputToken.save();
    outputToken.save();

    let fill = new Fill(tx.id + event.params.orderHash.toHex() + event.logIndex.toString());
    fill.transaction = tx.id;
    fill.timestamp = tx.timestamp;
    fill.blockNumber = tx.blockNumber;
    fill.logIndex = event.logIndex;
    fill.source = 'OtcOrder';
    fill.recipient = Bytes.fromHexString(taker.id) as Bytes;
    fill.inputToken = inputToken.id;
    fill.outputToken = outputToken.id;
    fill.inputTokenAmount = event.params.takerTokenFilledAmount;
    fill.outputTokenAmount = event.params.makerTokenFilledAmount;
    fill.provider = event.params.maker as Bytes;
    fill.save();

    let nativeFill = new NativeOrderFill(
        tx.id + '-' + event.params.orderHash.toHex() + '-' + event.logIndex.toString(),
    );
    nativeFill.transaction = tx.id;
    nativeFill.timestamp = tx.timestamp;
    nativeFill.blockNumber = tx.blockNumber;
    nativeFill.type = 'OtcOrder';
    nativeFill.orderHash = event.params.orderHash;
    nativeFill.maker = maker.id;
    nativeFill.taker = taker.id;
    nativeFill.inputToken = fill.inputToken;
    nativeFill.outputToken = fill.outputToken;
    nativeFill.inputTokenAmount = fill.inputTokenAmount;
    nativeFill.outputTokenAmount = fill.outputTokenAmount;
    // There is no pool field on otc orders
    nativeFill.pool = Bytes.fromHexString('0x');
    nativeFill.fee = BigInt.fromI32(0);
    nativeFill.save();

    {
        maker.nativeOrderFillCount = maker.nativeOrderFillCount.plus(BigInt.fromI32(1));
        maker.save();
    }

    {
        taker.nativeOrderFillCount = taker.nativeOrderFillCount.plus(BigInt.fromI32(1));
        taker.save();
    }

    {
        let txFills = tx.fills;
        txFills.push(fill.id);
        tx.fills = txFills;
        tx.save();
    }
}

export function handleLimitOrderFilledEvent(event: LimitOrderFilled): void {
    let tx = transactionFindOrCreate(event.transaction.hash, event.block);
    let maker = makerFindOrCreate(event.params.maker);
    let taker = takerFindOrCreate(event.params.taker);

    let inputToken = tokenFindOrCreate(event.params.takerToken);
    let outputToken = tokenFindOrCreate(event.params.makerToken);
    inputToken.limitOrderVolume =
        inputToken.limitOrderVolume.plus(event.params.takerTokenFilledAmount);
    outputToken.limitOrderVolume =
        outputToken.limitOrderVolume.plus(event.params.makerTokenFilledAmount);
    inputToken.save();
    outputToken.save();

    let fill = new Fill(tx.id + event.params.orderHash.toHex() + event.logIndex.toString());
    fill.transaction = tx.id;
    fill.blockNumber = tx.blockNumber;
    fill.timestamp = tx.timestamp;
    fill.logIndex = event.logIndex;
    fill.source = 'LimitOrder';
    fill.recipient = Bytes.fromHexString(taker.id) as Bytes;
    fill.inputToken = inputToken.id;
    fill.outputToken = outputToken.id;
    fill.inputTokenAmount = event.params.takerTokenFilledAmount;
    fill.outputTokenAmount = event.params.makerTokenFilledAmount;
    fill.provider = event.params.maker as Bytes;
    fill.save();

    let nativeFill = new NativeOrderFill(
        tx.id + '-' + event.params.orderHash.toHex() + '-' + event.logIndex.toString(),
    );
    nativeFill.transaction = tx.id;
    nativeFill.blockNumber = tx.blockNumber;
    nativeFill.timestamp = tx.timestamp;
    nativeFill.type = 'LimitOrder';
    nativeFill.maker = maker.id;
    nativeFill.taker = taker.id;
    nativeFill.orderHash = event.params.orderHash;
    nativeFill.inputToken = fill.inputToken;
    nativeFill.outputToken = fill.outputToken;
    nativeFill.inputTokenAmount = fill.inputTokenAmount;
    nativeFill.outputTokenAmount = fill.outputTokenAmount;
    nativeFill.pool = event.params.pool;
    nativeFill.fee = event.params.protocolFeePaid;
    nativeFill.save();

    {
        maker.nativeOrderFillCount = maker.nativeOrderFillCount.plus(BigInt.fromI32(1));
        maker.save();
    }

    {
        taker.nativeOrderFillCount = taker.nativeOrderFillCount.plus(BigInt.fromI32(1));
        taker.save();
    }

    {
        let txFills = tx.fills;
        txFills.push(fill.id);
        tx.fills = txFills;
        tx.save();
    }
}

export function handleSellToUniswapCall(call: SellToUniswapCall): void {
    log.debug('found sellToUniswap swap in tx {}', [call.transaction.hash.toHex()]);
    let tokenPath = call.inputs.tokens;

    if (tokenPath.length < 2) {
        return;
    }

    let tx = transactionFindOrCreate(call.transaction.hash, call.block);
    let fills = findSellToUniswapEventFills(tx, call);
    if (fills.length === 0) {
        // If no fills were found, the TX reverted.
        return;
    }
    let taker = takerFindOrCreate(call.from);

    let inputToken = tokenFindOrCreate(tokenPath[0]);
    let outputToken = tokenFindOrCreate(tokenPath[tokenPath.length - 1]);
    inputToken.swapVolume = inputToken.swapVolume.plus(call.inputs.sellAmount);
    outputToken.swapVolume = outputToken.swapVolume.plus(call.outputs.buyAmount);
    inputToken.save();
    outputToken.save();

    //let r = getRandomNumber();
    let swap = new Swap(tx.id + '-' + call.transaction.index.toString());
    swap.transaction = tx.id;
    swap.timestamp = tx.timestamp;
    swap.blockNumber = tx.blockNumber;
    swap.method = 'UniswapVIP';
    swap.fills = fillsToIds(fills);
    swap.inputToken = inputToken.id;
    swap.outputToken = outputToken.id;
    swap.inputTokenAmount = call.inputs.sellAmount;
    swap.outputTokenAmount = call.outputs.buyAmount;
    swap.taker = taker.id;
    swap.hint = call.inputs.isSushi ? 'Sushiswap' : 'UniswapV2';
    swap.save();

    {
        taker.swapCount = taker.swapCount.plus(BigInt.fromI32(1));
        taker.save();
    }

    {
        tx.lastSwap = swap.id;
        tx.save();
    }
}

export function handleSellToPancakeSwapCall(call: SellToPancakeSwapCall): void {
    log.debug('found sellToPancakeSwap swap in tx {}', [call.transaction.hash.toHex()]);
    let tokenPath = call.inputs.tokens;

    if (tokenPath.length < 2) {
        return;
    }

    let tx = transactionFindOrCreate(call.transaction.hash, call.block);
    let fills = findSellToPancakeEventFills(tx, call);
    if (fills.length === 0) {
        // If no fills were found, the TX reverted.
        return;
    }
    let taker = takerFindOrCreate(call.from);

    let inputToken = tokenFindOrCreate(tokenPath[0]);
    let outputToken = tokenFindOrCreate(tokenPath[tokenPath.length - 1]);
    inputToken.swapVolume = inputToken.swapVolume.plus(call.inputs.sellAmount);
    outputToken.swapVolume = outputToken.swapVolume.plus(call.outputs.buyAmount);
    inputToken.save();
    outputToken.save();


    //let r = getRandomNumber();
    let swap = new Swap(tx.id + '-' + call.transaction.index.toString());
    swap.transaction = tx.id;
    swap.timestamp = tx.timestamp;
    swap.blockNumber = tx.blockNumber;
    swap.method = 'PancakeSwapVIP';
    swap.fills = fillsToIds(fills);
    swap.inputToken = inputToken.id;
    swap.outputToken = outputToken.id;
    swap.inputTokenAmount = call.inputs.sellAmount;
    swap.outputTokenAmount = call.outputs.buyAmount;
    swap.taker = taker.id;
    swap.hint = 'PancakeSwap';
    swap.save();

    {
        taker.swapCount = taker.swapCount.plus(BigInt.fromI32(1));
        taker.save();
    }

    {
        tx.lastSwap = swap.id;
        tx.save();
    }
}

export function handleSellEthForTokenToUniswapV3(call: SellEthForTokenToUniswapV3Call): void {
    log.debug('found sellEthForTokenToUniswapV3 swap in tx {}', [call.transaction.hash.toHex()]);

    let tokenPath = decodeUniswapV3TokenPath(call.inputs.encodedPath);
    if (tokenPath.length < 2) {
        return;
    }

    let tx = transactionFindOrCreate(call.transaction.hash, call.block);
    let fills = findSellToUniswapV3EventFills(tx, tokenPath);
    if (fills.length === 0) {
        // If no fills were found, the TX reverted.
        return;
    }
    let taker = takerFindOrCreate(call.from);

    // HACK: Currently call.value is not exposed and there is no `sellAmount` parameter
    // for this function so for direct from EOA calls we can use `transaction.value`
    // but for others we guess it by taking the inputTokenAmount from the first
    // fill we found.
    let inputAmount = call.transaction.value;
    if (call.from != call.transaction.from) {
        inputAmount = fills[0].inputTokenAmount;
    }

    let inputToken = tokenFindOrCreate(tokenPath[0]);
    let outputToken = tokenFindOrCreate(tokenPath[tokenPath.length - 1]);
    inputToken.swapVolume = inputToken.swapVolume.plus(inputAmount);
    outputToken.swapVolume = outputToken.swapVolume.plus(call.outputs.buyAmount);
    inputToken.save();
    outputToken.save();

    //let r = getRandomNumber();
    let swap = new Swap(tx.id + '-' + call.transaction.index.toString());
    swap.transaction = tx.id;
    swap.timestamp = tx.timestamp;
    swap.blockNumber = tx.blockNumber;
    swap.method = 'Uniswap3VIP';
    swap.fills = fillsToIds(fills);
    swap.inputToken = inputToken.id;
    swap.outputToken = outputToken.id;
    // HACK: No call.value exposed so we incorrectly use transaction.value.
    swap.inputTokenAmount = inputAmount;
    swap.outputTokenAmount = call.outputs.buyAmount;
    swap.taker = taker.id;
    swap.save();

    {
        taker.swapCount = taker.swapCount.plus(BigInt.fromI32(1));
        taker.save();
    }

    {
        tx.lastSwap = swap.id;
        tx.save();
    }
}

export function handleSellTokenForEthToUniswapV3(call: SellTokenForEthToUniswapV3Call): void {
    log.debug('found sellTokenForEthToUniswapV3 swap in tx {}', [call.transaction.hash.toHex()]);

    let tokenPath = decodeUniswapV3TokenPath(call.inputs.encodedPath);
    if (tokenPath.length < 2) {
        return;
    }

    let tx = transactionFindOrCreate(call.transaction.hash, call.block);
    let fills = findSellToUniswapV3EventFills(tx, tokenPath);
    if (fills.length === 0) {
        // If no fills were found, the TX reverted.
        return;
    }
    let taker = takerFindOrCreate(call.from);

    let inputToken = tokenFindOrCreate(tokenPath[0]);
    let outputToken = tokenFindOrCreate(tokenPath[tokenPath.length - 1]);
    inputToken.swapVolume = inputToken.swapVolume.plus(call.inputs.sellAmount);
    outputToken.swapVolume = outputToken.swapVolume.plus(call.outputs.buyAmount);
    inputToken.save();
    outputToken.save();

    // let r = getRandomNumber();
    let swap = new Swap(tx.id + '-' + call.transaction.index.toString());
    swap.transaction = tx.id;
    swap.timestamp = tx.timestamp;
    swap.blockNumber = tx.blockNumber;
    swap.method = 'Uniswap3VIP';
    swap.fills = fillsToIds(fills);
    swap.inputToken = inputToken.id;
    swap.outputToken = outputToken.id;
    swap.inputTokenAmount = call.inputs.sellAmount;
    swap.outputTokenAmount = call.outputs.buyAmount;
    swap.taker = taker.id;
    swap.save();

    {
        taker.swapCount = taker.swapCount.plus(BigInt.fromI32(1));
        taker.save();
    }

    {
        tx.lastSwap = swap.id;
        tx.save();
    }
}

export function handleSellTokenForTokenToUniswapV3(call: SellTokenForTokenToUniswapV3Call): void {
    log.debug('found sellTokenForTokenToUniswapV3 swap in tx {}', [call.transaction.hash.toHex()]);

    let tokenPath = decodeUniswapV3TokenPath(call.inputs.encodedPath);
    if (tokenPath.length < 2) {
        return;
    }

    let tx = transactionFindOrCreate(call.transaction.hash, call.block);
    let fills = findSellToUniswapV3EventFills(tx, tokenPath);
    if (fills.length === 0) {
        // If no fills were found, the TX reverted.
        return;
    }
    let taker = takerFindOrCreate(call.from);

    let inputToken = tokenFindOrCreate(tokenPath[0]);
    let outputToken = tokenFindOrCreate(tokenPath[tokenPath.length - 1]);
    inputToken.swapVolume = inputToken.swapVolume.plus(call.inputs.sellAmount);
    outputToken.swapVolume = outputToken.swapVolume.plus(call.outputs.buyAmount);
    inputToken.save();
    outputToken.save();

    // let r = getRandomNumber();
    let swap = new Swap(tx.id + '-' + call.transaction.index.toString());
    swap.transaction = tx.id;
    swap.timestamp = tx.timestamp;
    swap.blockNumber = tx.blockNumber;
    swap.method = 'Uniswap3VIP';
    swap.fills = fillsToIds(fills);
    swap.inputToken = inputToken.id;
    swap.outputToken = outputToken.id;
    swap.inputTokenAmount = call.inputs.sellAmount;
    swap.outputTokenAmount = call.outputs.buyAmount;
    swap.taker = taker.id;
    swap.save();

    {
        taker.swapCount = taker.swapCount.plus(BigInt.fromI32(1));
        taker.save();
    }

    {
        tx.lastSwap = swap.id;
        tx.save();
    }
}

