import { Address, Bytes, BigInt, log } from "@graphprotocol/graph-ts";
import { normalizeTokenAddress } from ".";
import { SellToPancakeSwapCall, SellToUniswapCall } from "../../generated/ExchangeProxy/IZeroEx";
import { Fill, Swap, Transaction } from "../../generated/schema";
import { GET_EXCHANGE_PROXY_ADDRESS, GET_FLASH_WALLET_ADDRESS, GET_SANDBOX_ADDRESS } from "../constants/network";



export function findSwapEventFills(tx: Transaction, logIndex: BigInt | null = null): Fill[] {

    // Get the previous swap in this tx.
    let prevSwap: Swap | null = tx.lastSwap
        ? Swap.load(tx.lastSwap as string)
        : null;
    let txFills = tx.fills; // can't index directly
    let fills = [] as Fill[];
    for (let i = 0; i < txFills.length; ++i) {
        let fillId = txFills[i];
        let fill = Fill.load(fillId) as Fill;
        if (!fill.logIndex) {
            continue;
        }
        // Must be after the previous swap's event (if there is one)
        if (prevSwap) {
            if (prevSwap.logIndex) {
                if ((prevSwap.logIndex as BigInt).gt((fill.logIndex as BigInt))) {
                    continue;
                }
            }
        }
        if (logIndex) {
            // Must be before this swap event.
            if (logIndex.lt((fill.logIndex as BigInt))) {
                continue;
            }
        }
        fills.push(fill!);
    }
    return fills;
}


export function decodeUniswapV3TokenPath(encoded: Bytes): Address[] {
    // UniswapV3 paths are packed encoded as (address(token0), uint24(fee), address(token1), [...])
    if (encoded.length < 20 + 3 + 20) {
        // Must be at least one hop.
        return [];
    }
    let o = 0;
    let tokens = [] as Address[];
    while (encoded.length - o >= 20) {
        tokens.push(encoded.subarray(o, o + 20) as Address);
        o += 23; // Skip the token we just read + fee.
    }
    return tokens;
}


export function findSellToUniswapV3EventFills(tx: Transaction, tokenPath: Address[]): Fill[] {
    if (tokenPath.length < 2) {
        return [];
    }
    let inputToken = normalizeTokenAddress(tokenPath[0]).toHexString();
    let outputToken = normalizeTokenAddress(tokenPath[tokenPath.length - 1]).toHexString();
    // First grab all fills for the correct DEX that come from the EP.
    let fills = [] as Fill[];
    {
        let _fills = findSwapEventFills(tx);
        for (let i = 0; i < _fills.length; ++i) {
            let f = _fills[i];
            if (f.source == 'UniswapV3' && f.sender as Bytes == GET_EXCHANGE_PROXY_ADDRESS() as Bytes) {
                fills.push(f);
            }
        }
    }
    // Look for a single fill selling the input token amd buying the output token.
    for (let i = 0; i < fills.length; ++i) {
        let f = fills[i];
        if (f.inputToken == inputToken && f.outputToken == outputToken) {
            return [f];
        }
    }
    // Couldn't find a single A->B fill. Maybe it's a multi-hop. Try to find
    // the A->X and X->B fills and grab everything inbetween.
    for (let i = 0; i < fills.length - 1; ++i) {
        if (fills[i].inputToken == inputToken) {
            for (let j = i + 1; j < fills.length; ++j) {
                if (fills[j].outputToken == outputToken) {
                    return fills.slice(i, j + 1);
                }
            }
        }
    }
    // Oh well. 🤷
    log.warning('could not find {} VIP fills for tx {} ({} -> {})', ['UniswapV3', tx.id, inputToken, outputToken]);
    return [];
}


export function findTransformERC20Fills(tx: Transaction, logIndex: BigInt): Fill[] {
    let fills = findSwapEventFills(tx, logIndex);
    const r = [] as Fill[];
    for (let i = 0; i < fills.length; ++i) {
        // Flash wallet must be recipient.
        if (fills[i].recipient != GET_FLASH_WALLET_ADDRESS() as Bytes) {
            continue;
        }
        // If there is a sender, the EP must be it.
        // (native fills will not populate sender).
        if (fills[i].sender) { // Don't ask me why these two can't be in the same if()
            if (fills[i].sender as Bytes != GET_EXCHANGE_PROXY_ADDRESS() as Bytes) {
                continue;
            }
        }
        r.push(fills[i]);
    }
    if (r.length === 0) {
        log.warning('could not find transformERC20 fills for tx {}', [tx.id]);
    }
    return r;
}

export function findLiquidityProviderFills(tx: Transaction, logIndex: BigInt): Fill[] {
    let fills = findSwapEventFills(tx, logIndex);
    const r = [] as Fill[];
    for (let i = 0; i < fills.length; ++i) {
        // Must contain "LiquidityProviderFill" in ID.
        if (fills[i].id.indexOf('LiquidityProviderFill') === -1) {
            continue;
        }
        // There must be a sender.
        if (!fills[i].sender) {
            continue;
        }
        // The sandbox must be the sender.
        if (fills[i].sender as Bytes == GET_SANDBOX_ADDRESS() as Bytes) {
            continue;
        }
        r.push(fills[i]);
    }
    if (r.length === 0) {
        log.warning('could not find sellToLiquidityProvider fills for tx {}', [tx.id]);
    }
    return r;
}

export function findSellToUniswapEventFills(tx: Transaction, call: SellToUniswapCall): Fill[] {
    let tokenPath = call.inputs.tokens;
    if (tokenPath.length < 2) {
        return [];
    }
    let inputToken = normalizeTokenAddress(tokenPath[0]).toHexString();
    let outputToken = normalizeTokenAddress(tokenPath[tokenPath.length - 1]).toHexString();
    let source = call.inputs.isSushi ? 'Sushiswap' : 'UniswapV2';
    // First grab all fills for the correct DEX that come from the EP.
    let fills = [] as Fill[];
    {
        let _fills = findSwapEventFills(tx);
        for (let i = 0; i < _fills.length; ++i) {
            let f = _fills[i];
            if (f.source == source && f.sender as Bytes == GET_EXCHANGE_PROXY_ADDRESS() as Bytes) {
                fills.push(f);
            }
        }
    }
    // Look for a single fill selling the input token and buying the output token.
    for (let i = 0; i < fills.length; ++i) {
        let f = fills[i];
        if (f.inputToken == inputToken && f.outputToken == outputToken) {
            return [f];
        }
    }
    // Couldn't find a single A->B fill. Maybe it's a multi-hop. Try to find
    // the A->X and X->B fills and grab everything inbetween.
    for (let i = 0; i < fills.length - 1; ++i) {
        if (fills[i].inputToken == inputToken) {
            for (let j = i + 1; j < fills.length; ++j) {
                if (fills[j].outputToken == outputToken) {
                    return fills.slice(i, j + 1);
                }
            }
        }
    }
    // Oh well. 🤷
    log.warning('could not find {} VIP fills for tx {}', [source, tx.id]);
    return [];
}



export function findSellToPancakeEventFills(tx: Transaction, call: SellToPancakeSwapCall): Fill[] {
    let tokenPath = call.inputs.tokens;
    if (tokenPath.length < 2) {
        return [];
    }
    let inputToken = normalizeTokenAddress(tokenPath[0]).toHexString();
    let outputToken = normalizeTokenAddress(tokenPath[tokenPath.length - 1]).toHexString();
    let source = 'PancakeSwap';
    // First grab all fills for the correct DEX that come from the EP.
    let fills = [] as Fill[];
    {
        let _fills = findSwapEventFills(tx);
        for (let i = 0; i < _fills.length; ++i) {
            let f = _fills[i];
            if (f.source == source && f.sender as Bytes == GET_EXCHANGE_PROXY_ADDRESS() as Bytes) {
                fills.push(f);
            }
        }
    }
    // Look for a single fill selling the input token and buying the output token.
    for (let i = 0; i < fills.length; ++i) {
        let f = fills[i];
        if (f.inputToken == inputToken && f.outputToken == outputToken) {
            return [f];
        }
    }
    // Couldn't find a single A->B fill. Maybe it's a multi-hop. Try to find
    // the A->X and X->B fills and grab everything inbetween.
    for (let i = 0; i < fills.length - 1; ++i) {
        if (fills[i].inputToken == inputToken) {
            for (let j = i + 1; j < fills.length; ++j) {
                if (fills[j].outputToken == outputToken) {
                    return fills.slice(i, j + 1);
                }
            }
        }
    }
    // Oh well. 🤷
    log.warning('could not find {} VIP fills for tx {}', [source, tx.id]);
    return [];
}

