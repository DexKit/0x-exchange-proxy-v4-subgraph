import { Address, Bytes, BigInt, log } from "@graphprotocol/graph-ts";

export function bigIntToAddress(i: BigInt): Address {
    let s = i.toHexString();
    // Left-pad.
    return Bytes.fromHexString('0x' + s.slice(2).padStart(64, '0')) as Address;
}

export function bytesToBytes32(b: Bytes): Bytes {
    let s = b.toHexString();
    // Left-pad.
    return Bytes.fromHexString('0x' + s.slice(2).padStart(64, '0')) as Bytes;
}

export function legacyBridgeSourceIdToSource(sourceId: BigInt): string {
    switch (sourceId.toI32()) {
        case 0:
            return 'Balancer';
        case 1:
            return 'Bancor';
        case 2:
            return 'CoFiX';
        case 3:
            return 'Curve';
        case 4:
            return 'Cream';
        case 5:
            return 'CryptoCom';
        case 6:
            return 'Dodo';
        case 7:
            return 'Kyber';
        case 8:
            return 'LiquidityProvider';
        case 9:
            return 'Mooniswap';
        case 10:
            return 'MStable';
        case 11:
            return 'Oasis';
        case 12:
            return 'Shell';
        case 13:
            return 'Snowswap';
        case 14:
            return 'Sushiswap';
        case 15:
            return 'Swerve';
        case 16:
            return 'Uniswap';
        case 17:
            return 'UniswapV2';
        case 18:
            return 'Dodov2';
        case 19:
            return 'Linkswap';
        default:
            log.warning('encountered unknown BridgeFill source ID: {}', [sourceId.toString()]);
            return 'Unknown';
    }
}
