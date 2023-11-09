import { Address } from "@graphprotocol/graph-ts";
import { Token } from "../../generated/schema";
import { UniswapPair } from "../../generated/Uniswap/UniswapPair";
import { GET_APESWAP_ADDRESS, GET_BAKERYSWAP_ADDRESS, GET_CAFESWAP_ADDRESS, GET_JULSWAP_ADDRESS, GET_PANCAKESWAP_ADDRESS, GET_PANCAKESWAP_V2_ADDRESS, GET_SUSHISWAP_FACTORY_ADDRESS, GET_UNISWAP_V2_FACTORY_ADDRESS } from "../constants/network";
import { UniswapPairFactory } from "../../generated/Uniswap/UniswapPairFactory";
import { tokenFindOrCreate } from ".";

class PairInfo {
    public source: string | null;
    public token0: Token | null;
    public token1: Token | null;

    public isValid(): boolean {
        return !!this.source && !!this.token0 && !!this.token1;
    }
}

export function getPairInfo(pairAddress: Address): PairInfo {
    let info = new PairInfo();
    let pair = UniswapPair.bind(pairAddress);
    let pairFactoryResult = pair.try_factory();
    if (pairFactoryResult.reverted) {
        return info;
    }
    let pairFactoryAddress = Address.fromHexString(pairFactoryResult.value.toHexString()) as Address;
    if (pairFactoryAddress == GET_UNISWAP_V2_FACTORY_ADDRESS()) {
        info.source = 'UniswapV2';
    } else if (pairFactoryAddress == GET_SUSHISWAP_FACTORY_ADDRESS()) {
        info.source = 'Sushiswap';
    } else if (pairFactoryAddress == GET_PANCAKESWAP_ADDRESS()) {
        info.source = 'PancakeSwap';
    } else if (pairFactoryAddress == GET_PANCAKESWAP_V2_ADDRESS()) {
        info.source = 'PancakeSwapV2';
    } else if (pairFactoryAddress == GET_BAKERYSWAP_ADDRESS()) {
        info.source = 'BakerySwap';
    } else if (pairFactoryAddress == GET_APESWAP_ADDRESS()) {
        info.source = 'ApeSwap';
    } else if (pairFactoryAddress == GET_CAFESWAP_ADDRESS()) {
        info.source = 'CafeSwap';
    } else if (pairFactoryAddress == GET_JULSWAP_ADDRESS()) {
        info.source = 'JulSwap';
    } else {
        return info;
    }
    let token0Result = pair.try_token0();
    let token1Result = pair.try_token1();
    if (token0Result.reverted || token1Result.reverted) {
        return info;
    }
    {
        // Validate pair contract was created by factory.
        let factory = UniswapPairFactory.bind(pairFactoryAddress);
        let pairResult = factory.try_getPair(token0Result.value, token1Result.value);
        if (pairResult.reverted || pairResult.value != pairAddress) {
            return info;
        }
    }
    info.token0 = tokenFindOrCreate(token0Result.value);
    info.token1 = tokenFindOrCreate(token1Result.value);
    return info;
}
