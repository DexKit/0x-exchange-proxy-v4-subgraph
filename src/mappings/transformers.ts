import { Address, BigInt, Bytes, log } from '@graphprotocol/graph-ts';
import { Fill } from '../../generated/schema';
import { BridgeFill, BridgeFill1, ERC20BridgeTransfer } from '../../generated/Transformers/TransformerEvents';

import {
    bytes32ToString,
    tokenFindOrCreate,
    transactionFindOrCreate,
} from '../utils';
import { GET_EXCHANGE_PROXY_ADDRESS, GET_FLASH_WALLET_ADDRESS } from '../constants/network';
import { bigIntToAddress, bytesToBytes32, legacyBridgeSourceIdToSource } from '../utils/transformers';

export function handleLegacyBridgeFillEvent(event: BridgeFill): void {
    // Event must come from FW.
    if (event.address != GET_FLASH_WALLET_ADDRESS() as Bytes) {
        return;
    }

    let tx = transactionFindOrCreate(event.transaction.hash, event.block);
    let source = legacyBridgeSourceIdToSource(event.params.source);
    let inputToken = tokenFindOrCreate(event.params.inputToken);
    let outputToken = tokenFindOrCreate(event.params.outputToken);

    let fill = new Fill(tx.id + '-' + 'LegacyBridgeFill(' + source + ')-' + event.logIndex.toString());
    fill.transaction = tx.id;
    fill.timestamp = tx.timestamp;
    fill.blockNumber = tx.blockNumber;
    fill.logIndex = event.logIndex;
    fill.source = source;
    fill.recipient = GET_FLASH_WALLET_ADDRESS() as Bytes;
    fill.inputToken = inputToken.id;
    fill.outputToken = outputToken.id;
    fill.inputTokenAmount = event.params.inputTokenAmount;
    fill.outputTokenAmount = event.params.outputTokenAmount;
    fill.sender = GET_EXCHANGE_PROXY_ADDRESS() as Bytes;
    fill.provider = bigIntToAddress(event.params.source) as Bytes;
    fill.save();

    {
        let txFills = tx.fills;
        txFills.push(fill.id);
        tx.fills = txFills;
        tx.save();
    }
}

export function handleBridgeFillEvent(event: BridgeFill1): void {
    // Event must come from FW.
    if (event.address != GET_FLASH_WALLET_ADDRESS() as Bytes) {
        return;
    }

    let tx = transactionFindOrCreate(event.transaction.hash, event.block);
    log.debug('found source hex', [event.params.source.toHex()]);
    log.debug('found source string', [event.params.source.subarray(16).toString()]);
    // Lower 16 is the source ID
    let source = event.params.source.subarray(16).toString()//bytes32ToString(event.params.source.subarray(16) as Bytes);
    let inputToken = tokenFindOrCreate(event.params.inputToken);
    let outputToken = tokenFindOrCreate(event.params.outputToken);

    let fill = new Fill(tx.id + '-' + 'BridgeFill(' + source + ')-' + event.logIndex.toString());
    fill.transaction = tx.id;
    fill.timestamp = tx.timestamp;
    fill.blockNumber = tx.blockNumber;
    fill.logIndex = event.logIndex;
    fill.source = source;
    fill.recipient = GET_FLASH_WALLET_ADDRESS() as Bytes;
    fill.inputToken = inputToken.id;
    fill.outputToken = outputToken.id;
    fill.inputTokenAmount = event.params.inputTokenAmount;
    fill.outputTokenAmount = event.params.outputTokenAmount;
    fill.sender = GET_EXCHANGE_PROXY_ADDRESS() as Bytes;
    // Upper 16 is the protocol ID
    fill.provider = bytesToBytes32(Bytes.fromUint8Array(event.params.source.subarray(0, 16)));
    fill.save();

    {
        let txFills = tx.fills;
        txFills.push(fill.id);
        tx.fills = txFills;
        tx.save();
    }
}

export function handleERC20BridgeTransferEvent(event: ERC20BridgeTransfer): void {
    // Event must come from FW.
    if (event.address != GET_FLASH_WALLET_ADDRESS() as Bytes) {
        return;
    }

    let tx = transactionFindOrCreate(event.transaction.hash, event.block);
    let source = event.params.from.toHexString();
    let inputToken = tokenFindOrCreate(event.params.inputToken);
    let outputToken = tokenFindOrCreate(event.params.outputToken);

    let fill = new Fill(tx.id + '-' + 'ERC20BridgeTransfer(' + source + ')-' + event.logIndex.toString());
    fill.transaction = tx.id;
    fill.timestamp = tx.timestamp;
    fill.blockNumber = tx.blockNumber;
    fill.logIndex = event.logIndex;
    fill.source = source;
    fill.recipient = GET_FLASH_WALLET_ADDRESS() as Bytes;
    fill.inputToken = inputToken.id;
    fill.outputToken = outputToken.id;
    fill.inputTokenAmount = event.params.inputTokenAmount;
    fill.outputTokenAmount = event.params.outputTokenAmount;
    fill.sender = GET_EXCHANGE_PROXY_ADDRESS() as Bytes;
    fill.provider = event.params.from as Bytes;
    fill.save();

    {
        let txFills = tx.fills;
        txFills.push(fill.id);
        tx.fills = txFills;
        tx.save();
    }
}

