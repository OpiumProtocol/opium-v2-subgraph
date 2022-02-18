import { LogDataProvided } from "../generated/OracleAggregator/OracleAggregator";
import {
  loadOrCreateOracleIdEntity,
  loadOrCreateOracleDataEntity,
} from "../utils/oracles";

export function handleLogDataProvided(event: LogDataProvided): void {
  // Register OracleId
  loadOrCreateOracleIdEntity(event.params._oracleId);
  // RegisterOracleData
  loadOrCreateOracleDataEntity(
    event.params._oracleId,
    event.params._timestamp,
    event.params._data,
    event.block.timestamp,
    event.transaction.hash
  );
}
