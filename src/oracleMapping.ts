import { LogDataProvided } from "../generated/OracleAggregator/OracleAggregator";
import {
  loadOrCreateOracleIdEntity,
  loadOrCreateOracleDataEntity,
} from "../utils/index";

export function handleLogDataProvided(event: LogDataProvided): void {
  let oracleIdEntity = loadOrCreateOracleIdEntity(event.params._oracleId);
  let oracleDataEntity = loadOrCreateOracleDataEntity(
    event.params._oracleId,
    event.params._timestamp,
    event.params._data,
    event.block.timestamp,
    event.transaction.hash
  );

  oracleIdEntity.save();
  oracleDataEntity.save();
}
