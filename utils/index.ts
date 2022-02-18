import { Address } from "@graphprotocol/graph-ts";

export const zeroAddress = "0x0000000000000000000000000000000000000000";

export function isZeroAddress(value: Address): boolean {
  return value.toHexString() == zeroAddress;
};
