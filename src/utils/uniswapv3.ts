import { Address } from "@graphprotocol/graph-ts";
import { Token } from "../../generated/schema";
import { UniswapV3Pool } from "../../generated/UniswapV3/UniswapV3Pool";
import { GET_UNISWAP_V3_FACTORY_ADDRESS } from "../constants/network";
import { UniswapV3Factory } from "../../generated/UniswapV3/UniswapV3Factory";
import { tokenFindOrCreate } from ".";

class PoolInfo {
    public token0: Token | null;
    public token1: Token | null;

    public isValid(): boolean {
        return !!this.token0 && !!this.token1;
    }
}

export function getPoolInfo(pairAddress: Address): PoolInfo {
    let info = new PoolInfo();
    let pool = UniswapV3Pool.bind(pairAddress);
    let pairFactoryResult = pool.try_factory();
    if (pairFactoryResult.reverted) {
        return info;
    }
    let pairFactoryAddress = pairFactoryResult.value;
    if (pairFactoryAddress != GET_UNISWAP_V3_FACTORY_ADDRESS()) {
        return info; // invalid pool
    }
    let token0Result = pool.try_token0();
    let token1Result = pool.try_token1();
    let feeResult = pool.try_fee();
    if (token0Result.reverted || token1Result.reverted || feeResult.reverted) {
        return info;
    }
    {
        // Validate pool contract was created by factory.
        let factory = UniswapV3Factory.bind(pairFactoryAddress);
        let pairResult = factory.try_getPool(token0Result.value, token1Result.value, feeResult.value);
        if (pairResult.reverted || pairResult.value != pairAddress) {
            return info;
        }
    }
    info.token0 = tokenFindOrCreate(token0Result.value);
    info.token1 = tokenFindOrCreate(token1Result.value);
    return info;
}
