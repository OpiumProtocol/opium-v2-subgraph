import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { OpiumPositionToken } from "../generated/OpiumProxyFactory/OpiumPositionToken";
import {
  Holder,
  Position,
  HolderPosition,
  Ticker,
} from "../generated/schema";

export const loadOrCreateHolderPositionEntity = (
  holderAddress: Address,
  derivativeHash: string
): HolderPosition => {
  let holderPositionId = `${holderAddress.toHex()}:${derivativeHash}`;
  let holderPositionEntity = HolderPosition.load(holderPositionId);
  if (holderPositionEntity === null) {
    holderPositionEntity = new HolderPosition(holderPositionId);

    holderPositionEntity.holder = holderAddress.toHex();
    holderPositionEntity.ticker = derivativeHash;
    holderPositionEntity.longBalance = BigInt.fromI32(0);
    holderPositionEntity.shortBalance = BigInt.fromI32(0);

    holderPositionEntity.save();
  }
  return holderPositionEntity;
};

export const loadOrCreateHolderEntity = (
  holderAddress: Address,
  createdAt: BigInt,
  createdTx: Bytes
): Holder => {
  let holderId = holderAddress.toHex();
  let holderEntity = Holder.load(holderId);

  if (holderEntity === null) {
    holderEntity = new Holder(holderId);
    // on-chain metadata
    holderEntity.createdAt = createdAt;
    holderEntity.createdTx = createdTx;

    holderEntity.save();
  }

  return holderEntity;
};

export const loadOrCreatePositionEntity = (
  positionAddress: Address
): Position => {
  let positionId = positionAddress.toHex();
  let positionEntity = Position.load(positionId);

  if (positionEntity === null) {
    positionEntity = new Position(positionId);
    let contract = OpiumPositionToken.bind(positionAddress);
    let positionTokenData = contract.getPositionTokenData();

    positionEntity.name = contract.name();
    positionEntity.symbol = contract.symbol();
    positionEntity.totalSupply = BigInt.fromI32(0);
    positionEntity.isLong = positionTokenData.positionType === 1; // SHORT = 0, LONG = 1
    positionEntity.ticker = positionTokenData.derivativeHash.toHex();
    positionEntity.endTime = positionTokenData.derivative.endTime;

    positionEntity.save();
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
  let tickerId = derivativeHash.toHex();
  let tickerEntity = Ticker.load(tickerId);
  
  if (tickerEntity === null) {
    tickerEntity = new Ticker(tickerId);

    const derivativeData = OpiumPositionToken.bind(
      longPositionAddress
    ).getPositionTokenData();
  
    // Derivative data
    tickerEntity.margin = derivativeData.derivative.margin;
    tickerEntity.endTime = derivativeData.derivative.endTime;
    tickerEntity.params = derivativeData.derivative.params;
    tickerEntity.oracleId = derivativeData.derivative.oracleId;
    tickerEntity.token = derivativeData.derivative.token;
    tickerEntity.syntheticId = derivativeData.derivative.syntheticId;
    // Positions data
    tickerEntity.longPosition = longPositionAddress.toHex();
    tickerEntity.shortPosition = shortPositionAddress.toHex();
    // Tx metadata
    tickerEntity.createdAt = createdAt;
    tickerEntity.createdTx = createdTx;

    tickerEntity.save()
  }

  return tickerEntity;
};
