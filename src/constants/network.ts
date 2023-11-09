import { Address, dataSource, log, TypedMap } from "@graphprotocol/graph-ts";
import { ZERO_ADDRESS } from ".";

namespace Network {
    export const MAINNET = "mainnet";
    export const OPTMISM = "optimism";
    export const BSC = "bsc";
    export const POLYGON = "matic";
    export const FANTOM = "fantom";
    export const AVALANCHE = "avalanche";
    export const BASE = "base";
    export const CELO = "celo";
    export const ARBITRUM_ONE = "arbitrum-one";
    // used for not supported networks
    export const NOT_SUPPORTED = "not_supported_network";
}

let WETH_ADDRESS = new TypedMap<string, Address>();

WETH_ADDRESS.set(Network.MAINNET, Address.fromString("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"));
WETH_ADDRESS.set(Network.OPTMISM, Address.fromString("0x4200000000000000000000000000000000000006"));
WETH_ADDRESS.set(Network.BSC, Address.fromString("0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"));
WETH_ADDRESS.set(Network.FANTOM, Address.fromString("0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"));
WETH_ADDRESS.set(Network.POLYGON, Address.fromString("0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"));
WETH_ADDRESS.set(Network.AVALANCHE, Address.fromString("0xdb6f1920a889355780af7570773609bd8cb1f498"));
WETH_ADDRESS.set(Network.BASE, Address.fromString("0x22f9dcf4647084d6c31b2765f6910cd85c178c18"));
WETH_ADDRESS.set(Network.ARBITRUM_ONE, Address.fromString("0x4200000000000000000000000000000000000006"));
WETH_ADDRESS.set(Network.NOT_SUPPORTED, ZERO_ADDRESS);

let EXCHANGE_PROXY_ADDRESS = new TypedMap<string, Address>();

EXCHANGE_PROXY_ADDRESS.set(Network.MAINNET, Address.fromString("0xdef1c0ded9bec7f1a1670819833240f027b25eff"));
EXCHANGE_PROXY_ADDRESS.set(Network.OPTMISM, Address.fromString("0xdef1abe32c034e558cdd535791643c58a13acc10"));
EXCHANGE_PROXY_ADDRESS.set(Network.BSC, Address.fromString("0xdef1c0ded9bec7f1a1670819833240f027b25eff"));
EXCHANGE_PROXY_ADDRESS.set(Network.FANTOM, Address.fromString("0xdef189deaef76e379df891899eb5a00a94cbc250"));
EXCHANGE_PROXY_ADDRESS.set(Network.POLYGON, Address.fromString("0xdef1c0ded9bec7f1a1670819833240f027b25eff"));
EXCHANGE_PROXY_ADDRESS.set(Network.AVALANCHE, Address.fromString("0xdef1c0ded9bec7f1a1670819833240f027b25eff"));
EXCHANGE_PROXY_ADDRESS.set(Network.BASE, Address.fromString("0xdef1c0ded9bec7f1a1670819833240f027b25eff"));
EXCHANGE_PROXY_ADDRESS.set(Network.CELO, Address.fromString("0xdef1c0ded9bec7f1a1670819833240f027b25eff"));
EXCHANGE_PROXY_ADDRESS.set(Network.ARBITRUM_ONE, Address.fromString("0xdef1c0ded9bec7f1a1670819833240f027b25eff"));
EXCHANGE_PROXY_ADDRESS.set(Network.NOT_SUPPORTED, ZERO_ADDRESS);

let FLASH_WALLET_ADDRESS = new TypedMap<string, Address>();

FLASH_WALLET_ADDRESS.set(Network.MAINNET, Address.fromString("0x22f9dcf4647084d6c31b2765f6910cd85c178c18"));
FLASH_WALLET_ADDRESS.set(Network.OPTMISM, Address.fromString("0xa3128d9b7cca7d5af29780a56abeec12b05a6740"));
FLASH_WALLET_ADDRESS.set(Network.BSC, Address.fromString("0xdb6f1920a889355780af7570773609bd8cb1f498"));
FLASH_WALLET_ADDRESS.set(Network.FANTOM, Address.fromString("0xb4d961671cadfed687e040b076eee29840c142e5"));
FLASH_WALLET_ADDRESS.set(Network.POLYGON, Address.fromString("0xdb6f1920a889355780af7570773609bd8cb1f498"));
FLASH_WALLET_ADDRESS.set(Network.AVALANCHE, Address.fromString("0xdb6f1920a889355780af7570773609bd8cb1f498"));
FLASH_WALLET_ADDRESS.set(Network.BASE, Address.fromString("0x22f9dcf4647084d6c31b2765f6910cd85c178c18"));
FLASH_WALLET_ADDRESS.set(Network.ARBITRUM_ONE, Address.fromString("0xdb6f1920a889355780af7570773609bd8cb1f498"));
FLASH_WALLET_ADDRESS.set(Network.NOT_SUPPORTED, ZERO_ADDRESS);

let UNISWAP_V2_FACTORY_ADDRESS = new TypedMap<string, Address>();

UNISWAP_V2_FACTORY_ADDRESS.set(Network.MAINNET, Address.fromString("0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f"));
UNISWAP_V2_FACTORY_ADDRESS.set(Network.OPTMISM, ZERO_ADDRESS);
UNISWAP_V2_FACTORY_ADDRESS.set(Network.BSC, ZERO_ADDRESS);
UNISWAP_V2_FACTORY_ADDRESS.set(Network.FANTOM, ZERO_ADDRESS);
UNISWAP_V2_FACTORY_ADDRESS.set(Network.POLYGON, ZERO_ADDRESS);
UNISWAP_V2_FACTORY_ADDRESS.set(Network.AVALANCHE, ZERO_ADDRESS);
UNISWAP_V2_FACTORY_ADDRESS.set(Network.BASE, ZERO_ADDRESS);
UNISWAP_V2_FACTORY_ADDRESS.set(Network.ARBITRUM_ONE, ZERO_ADDRESS);
UNISWAP_V2_FACTORY_ADDRESS.set(Network.NOT_SUPPORTED, ZERO_ADDRESS);

let UNISWAP_V3_FACTORY_ADDRESS = new TypedMap<string, Address>();
// https://docs.uniswap.org/contracts/v3/reference/deployments
UNISWAP_V3_FACTORY_ADDRESS.set(Network.MAINNET, Address.fromString('0x1F98431c8aD98523631AE4a59f267346ea31F984'));
UNISWAP_V3_FACTORY_ADDRESS.set(Network.OPTMISM, Address.fromString('0x1F98431c8aD98523631AE4a59f267346ea31F984'));
UNISWAP_V3_FACTORY_ADDRESS.set(Network.BSC, Address.fromString('0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7'));
UNISWAP_V3_FACTORY_ADDRESS.set(Network.FANTOM, ZERO_ADDRESS);
UNISWAP_V3_FACTORY_ADDRESS.set(Network.POLYGON, Address.fromString('0x1F98431c8aD98523631AE4a59f267346ea31F984'));
UNISWAP_V3_FACTORY_ADDRESS.set(Network.AVALANCHE, ZERO_ADDRESS);
UNISWAP_V3_FACTORY_ADDRESS.set(Network.BASE, Address.fromString('0x33128a8fC17869897dcE68Ed026d694621f6FDfD'));
UNISWAP_V3_FACTORY_ADDRESS.set(Network.ARBITRUM_ONE, Address.fromString('0x1F98431c8aD98523631AE4a59f267346ea31F984'));
UNISWAP_V3_FACTORY_ADDRESS.set(Network.CELO, Address.fromString('0xAfE208a311B21f13EF87E33A90049fC17A7acDEc'));
UNISWAP_V3_FACTORY_ADDRESS.set(Network.NOT_SUPPORTED, ZERO_ADDRESS);

let SUSHISWAP_FACTORY_ADDRESS = new TypedMap<string, Address>();

SUSHISWAP_FACTORY_ADDRESS.set(Network.MAINNET, Address.fromString('0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac'));
SUSHISWAP_FACTORY_ADDRESS.set(Network.OPTMISM, ZERO_ADDRESS);
SUSHISWAP_FACTORY_ADDRESS.set(Network.BSC, Address.fromString('0xc35DADB65012eC5796536bD9864eD8773aBc74C4'));
SUSHISWAP_FACTORY_ADDRESS.set(Network.FANTOM, ZERO_ADDRESS);
SUSHISWAP_FACTORY_ADDRESS.set(Network.POLYGON, ZERO_ADDRESS);
SUSHISWAP_FACTORY_ADDRESS.set(Network.AVALANCHE, ZERO_ADDRESS);
SUSHISWAP_FACTORY_ADDRESS.set(Network.BASE, ZERO_ADDRESS);
SUSHISWAP_FACTORY_ADDRESS.set(Network.ARBITRUM_ONE, ZERO_ADDRESS);
SUSHISWAP_FACTORY_ADDRESS.set(Network.NOT_SUPPORTED, ZERO_ADDRESS);
// https://github.com/0xProject/protocol/blob/development/contracts/zero-ex/contracts/src/features/PancakeSwapFeature.sol
let PANCAKESWAP_FACTORY_ADDRESS = new TypedMap<string, Address>();

PANCAKESWAP_FACTORY_ADDRESS.set(Network.BSC, Address.fromString('0xbcfccbde45ce874adcb698cc183debcf17952812'));

let PANCAKESWAP_V2_FACTORY_ADDRESS = new TypedMap<string, Address>();

PANCAKESWAP_V2_FACTORY_ADDRESS.set(Network.BSC, Address.fromString('0xbcfccbde45ce874adcb698cc183debcf17952812'));

let BAKERYSWAP_FACTORY_ADDRESS = new TypedMap<string, Address>();

BAKERYSWAP_FACTORY_ADDRESS.set(Network.BSC, Address.fromString('0x01bf7c66c6bd861915cdaae475042d3c4bae16a7'));

let APESWAP_FACTORY_ADDRESS = new TypedMap<string, Address>();

APESWAP_FACTORY_ADDRESS.set(Network.BSC, Address.fromString('0x0841bd0b734e4f5853f0dd8d7ea041c241fb0da6'));

let CAFESWAP_FACTORY_ADDRESS = new TypedMap<string, Address>();

CAFESWAP_FACTORY_ADDRESS.set(Network.BSC, Address.fromString('0x3e708fdbe3ada63fc94f8f61811196f1302137ad'));

let CHEESESWAP_FACTORY_ADDRESS = new TypedMap<string, Address>();

CHEESESWAP_FACTORY_ADDRESS.set(Network.BSC, Address.fromString('0xdd538e4fd1b69b7863e1f741213276a6cf1efb3b'));

let JULSWAP_FACTORY_ADDRESS = new TypedMap<string, Address>();

JULSWAP_FACTORY_ADDRESS.set(Network.BSC, Address.fromString('0x553990f2cba90272390f62c5bdb1681ffc899675'));


let SANDBOX_ADDRESS = new TypedMap<string, Address>();

SANDBOX_ADDRESS.set(Network.MAINNET, Address.fromString('0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac'));
SANDBOX_ADDRESS.set(Network.OPTMISM, ZERO_ADDRESS);
SANDBOX_ADDRESS.set(Network.BSC, Address.fromString('0xde7b2747624a647600fdb349184d0448ab954929'));
SANDBOX_ADDRESS.set(Network.FANTOM, Address.fromString('0xca64d4225804f2ae069760cb5ff2f1d8bac1c2f9'));
SANDBOX_ADDRESS.set(Network.POLYGON, Address.fromString('0x4dd97080adf36103bd3db822f9d3c0e44890fd69'));
SANDBOX_ADDRESS.set(Network.AVALANCHE, Address.fromString('0x8953c63d0858d286cc407cd6f8e26b9cbd02a511'));
SANDBOX_ADDRESS.set(Network.BASE, Address.fromString('0x407b4128e9ecad8769b2332312a9f655cb9f5f3a'));
SANDBOX_ADDRESS.set(Network.CELO, ZERO_ADDRESS);
SANDBOX_ADDRESS.set(Network.ARBITRUM_ONE, ZERO_ADDRESS);
SANDBOX_ADDRESS.set(Network.NOT_SUPPORTED, ZERO_ADDRESS);





// util function to get address on any network and fallback for zero address if network is not supported
function GET_ADDRESS(map: TypedMap<string, Address>): Address {
    const network = dataSource.network();
    if (map.isSet(network)) {
        return map.get(network) as Address;
    } else {
        log.error("GET_ADDRESS - unsupported network", [network]);
        return map.get(Network.NOT_SUPPORTED) as Address;
    }
}

export function GET_WETH_ADDRESS(): Address {
    return GET_ADDRESS(WETH_ADDRESS);
}

export function GET_EXCHANGE_PROXY_ADDRESS(): Address {
    return GET_ADDRESS(EXCHANGE_PROXY_ADDRESS);
}

export function GET_FLASH_WALLET_ADDRESS(): Address {
    return GET_ADDRESS(FLASH_WALLET_ADDRESS);
}

export function GET_UNISWAP_V2_FACTORY_ADDRESS(): Address {
    return GET_ADDRESS(UNISWAP_V2_FACTORY_ADDRESS);
}

export function GET_UNISWAP_V3_FACTORY_ADDRESS(): Address {
    return GET_ADDRESS(UNISWAP_V3_FACTORY_ADDRESS);
}

export function GET_SUSHISWAP_FACTORY_ADDRESS(): Address {
    return GET_ADDRESS(SUSHISWAP_FACTORY_ADDRESS);
}

export function GET_SANDBOX_ADDRESS(): Address {
    return GET_ADDRESS(SANDBOX_ADDRESS);
}

// PancakeSwapVip feature related forks

export function GET_PANCAKESWAP_ADDRESS(): Address {
    return GET_ADDRESS(PANCAKESWAP_FACTORY_ADDRESS);
}

export function GET_PANCAKESWAP_V2_ADDRESS(): Address {
    return GET_ADDRESS(PANCAKESWAP_V2_FACTORY_ADDRESS);
}

export function GET_BAKERYSWAP_ADDRESS(): Address {
    return GET_ADDRESS(BAKERYSWAP_FACTORY_ADDRESS);
}

export function GET_APESWAP_ADDRESS(): Address {
    return GET_ADDRESS(APESWAP_FACTORY_ADDRESS);
}

export function GET_CAFESWAP_ADDRESS(): Address {
    return GET_ADDRESS(CAFESWAP_FACTORY_ADDRESS);
}

export function GET_JULSWAP_ADDRESS(): Address {
    return GET_ADDRESS(JULSWAP_FACTORY_ADDRESS);
}