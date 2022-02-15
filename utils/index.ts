import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { OpiumPositionToken, OpiumPositionToken__getPositionTokenDataResult_opiumPositionTokenParamsStruct } from "../generated/OpiumProxyFactory/OpiumPositionToken";
import {
  Holder,
  OracleData,
  OracleId,
  Position,
  PositionBalance,
  Ticker,
} from "../generated/schema";

export const zeroAddress = "0x0000000000000000000000000000000000000000";

export function isZeroAddress(value: Address): boolean {
  return value.toHexString() == zeroAddress;
}

export function getERC20Symbol(address: Address): string {
  let contract = OpiumPositionToken.bind(address);

  let symbolCall = contract.try_symbol();
  let fallbackSymbol = "Unknown";

  if (!symbolCall.reverted) {
    return symbolCall.value;
  }

  return fallbackSymbol;
}

export function getERC20Name(address: Address): string {
  let contract = OpiumPositionToken.bind(address);

  let nameCall = contract.try_name();
  let fallbackName = "Unknown";

  if (!nameCall.reverted) {
    return nameCall.value;
  }

  return fallbackName;
}

export function getPositionDerivativeData(address: Address): OpiumPositionToken__getPositionTokenDataResult_opiumPositionTokenParamsStruct | null {
  let contract = OpiumPositionToken.bind(address);

  let derivativeDataCall = contract.try_getPositionTokenData();

  if (!derivativeDataCall.reverted) {
    return derivativeDataCall.value;
  }

  return null;
}

export const getPositionBalanceId = (
  holderAddress: Address,
  positionAddress: Address
): string => {
  return holderAddress.toHex() + "-" + positionAddress.toHex();
};

export const getOracleDataId = (
  oracleIdAddress: Address,
  timestamp: BigInt
): string => {
  return oracleIdAddress.toHex() + "-" + timestamp.toString();
};

export const loadOrCreatePositionBalanceEntity = (
  holderAddress: Address,
  positionAddress: Address,
  derivativeHash: Bytes
): PositionBalance => {
  let positionBalanceEntity = PositionBalance.load(
    getPositionBalanceId(holderAddress, positionAddress)
  );
  if (!positionBalanceEntity) {
    positionBalanceEntity = new PositionBalance(
      getPositionBalanceId(holderAddress, positionAddress)
    );
  }

  positionBalanceEntity.holder = holderAddress.toHex();
  positionBalanceEntity.derivativeHash = derivativeHash;
  return positionBalanceEntity;
};

export const loadOrCreateHolderEntity = (
  holderAddress: Address,
  createdAt: BigInt,
  createdTx: Bytes
): Holder => {
  let holderEntity = Holder.load(holderAddress.toHex());
  if (!holderEntity) {
    holderEntity = new Holder(holderAddress.toHex());
  }
  // on-chain metadata
  holderEntity.createdAt = createdAt;
  holderEntity.createdTx = createdTx;
  return holderEntity;
};

export const loadOrCreatePositionEntity = (
  positionAddress: Address
): Position => {
  let positionEntity = Position.load(positionAddress.toHex());
  if (!positionEntity) {
    positionEntity = new Position(positionAddress.toHex());
  }
  const name = getERC20Name(positionAddress);
  const symbol = getERC20Symbol(positionAddress);
  const derivativeData = getPositionDerivativeData(positionAddress)

  positionEntity.name = name;
  positionEntity.symbol = symbol;
  if(derivativeData) {
    positionEntity.derivativeHash = derivativeData.derivativeHash;
  }

  return positionEntity;
};

export const loadOrCreateTickerEntity = (
  derivativeHash: Bytes,
  longPositionAddress: Address,
  shortPositionAddress: Address,
  createdAt: BigInt,
  createdTx: Bytes
): Ticker => {
  let tickerEntity = Ticker.load(derivativeHash.toHex());
  if (!tickerEntity) {
    tickerEntity = new Ticker(derivativeHash.toHex());
  }
  const derivativeData = OpiumPositionToken.bind(
    longPositionAddress
  ).getPositionTokenData();

  // derivative data
  tickerEntity.margin = derivativeData.derivative.margin;
  tickerEntity.endTime = derivativeData.derivative.endTime;
  tickerEntity.params = derivativeData.derivative.params;
  tickerEntity.oracleId = derivativeData.derivative.oracleId;
  tickerEntity.token = derivativeData.derivative.token;
  // positions data
  tickerEntity.longPositionAddress = longPositionAddress;
  tickerEntity.shortPositionAddress = shortPositionAddress;
  // on-chain metadata
  tickerEntity.createdAt = createdAt;
  tickerEntity.createdTx = createdTx;

  return tickerEntity;
};

export const loadOrCreateOracleIdEntity = (
  oracleIdAddress: Address
): OracleId => {
  let oracleIdEntity = OracleId.load(oracleIdAddress.toHex());
  if (!oracleIdEntity) {
    oracleIdEntity = new OracleId(oracleIdAddress.toHex());
  }
  return oracleIdEntity;
};

export const loadOrCreateOracleDataEntity = (
  oracleIdAddress: Address,
  timestamp: BigInt,
  data: BigInt,
  createdAt: BigInt,
  createdTx: Bytes
): OracleData => {
  let oracleDataEntity = OracleData.load(
    getOracleDataId(oracleIdAddress, timestamp)
  );
  if (!oracleDataEntity) {
    oracleDataEntity = new OracleData(
      getOracleDataId(oracleIdAddress, timestamp)
    );
  }

  oracleDataEntity.oracleId = oracleIdAddress.toHex();
  oracleDataEntity.timestamp = timestamp;
  oracleDataEntity.data = data;

  oracleDataEntity.createdAt = createdAt;
  oracleDataEntity.createdTx = createdTx;
  return oracleDataEntity;
};
