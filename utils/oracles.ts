import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { OracleData, OracleId } from "../generated/schema";

export const loadOrCreateOracleIdEntity = (
  oracleIdAddress: Address
): OracleId => {
  let oracleIdId = oracleIdAddress.toHex();
  let oracleIdEntity = OracleId.load(oracleIdId);
  if (oracleIdEntity === null) {
    oracleIdEntity = new OracleId(oracleIdId);
    oracleIdEntity.save();
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
  let oracleDataId = `${oracleIdAddress.toHex()}:${timestamp.toString()}`;
  let oracleDataEntity = OracleData.load(oracleDataId);
  if (!oracleDataEntity) {
    oracleDataEntity = new OracleData(oracleDataId);

    oracleDataEntity.oracleId = oracleIdAddress.toHex();
    oracleDataEntity.timestamp = timestamp;
    oracleDataEntity.data = data;

    oracleDataEntity.createdAt = createdAt;
    oracleDataEntity.createdTx = createdTx;

    oracleDataEntity.save();
  }
  return oracleDataEntity;
};
