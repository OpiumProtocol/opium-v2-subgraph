import { Transfer } from "../generated/OpiumProxyFactory/OpiumPositionToken";
import { LogPositionTokenPair } from "../generated/OpiumProxyFactory/OpiumProxyFactory";
import { OpiumPositionToken as OpiumPositionTokenTemplate } from "../generated/templates";
import {
  loadOrCreateHolderEntity,
  loadOrCreateHolderPositionEntity,
  loadOrCreatePositionEntity,
  loadOrCreateTickerEntity,
} from "../utils/tickersAndPositions";
import { isZeroAddress } from "../utils";

export function handleLogPositionTokenPair(event: LogPositionTokenPair): void {
  // Register new Ticker
  loadOrCreateTickerEntity(
    event.params._derivativeHash,
    event.params._longPositionAddress,
    event.params._shortPositionAddress,
    event.block.timestamp,
    event.transaction.hash
  );
  // Register new LONG position
  loadOrCreatePositionEntity(event.params._longPositionAddress);
  // Register new SHORT position
  loadOrCreatePositionEntity(event.params._shortPositionAddress);

  // Initialize the OpiumPositionToken templates
  OpiumPositionTokenTemplate.create(event.params._longPositionAddress);
  OpiumPositionTokenTemplate.create(event.params._shortPositionAddress);
}

export function handleTransfer(event: Transfer): void {
  const positionEntity = loadOrCreatePositionEntity(event.address);

  // Mint action => Transfer(address(0), account, amount);
  if (isZeroAddress(event.params.from) && !isZeroAddress(event.params.to)) {
    // Register To Holder
    loadOrCreateHolderEntity(
      event.params.to,
      event.block.timestamp,
      event.transaction.hash
    );
    let holderPositionEntity = loadOrCreateHolderPositionEntity(
      event.params.to,
      positionEntity.ticker
    );

    // Update Holder balance
    if (positionEntity.isLong) {
      holderPositionEntity.longBalance = holderPositionEntity.longBalance.plus(event.params.value);
    } else {
      holderPositionEntity.shortBalance = holderPositionEntity.shortBalance.plus(event.params.value);
    }
    holderPositionEntity.save();

    // Update totalSupply
    positionEntity.totalSupply = positionEntity.totalSupply.plus(event.params.value);
    positionEntity.save();

    return
  }

  // Burn action => Transfer(account, address(0), amount);
  if (!isZeroAddress(event.params.from) && isZeroAddress(event.params.to)) {
    // Register From Holder
    loadOrCreateHolderEntity(
      event.params.from,
      event.block.timestamp,
      event.transaction.hash
    );
    let holderPositionEntity = loadOrCreateHolderPositionEntity(
      event.params.from,
      positionEntity.ticker
    );

    // Update Holder balance
    if (positionEntity.isLong) {
      holderPositionEntity.longBalance = holderPositionEntity.longBalance.minus(event.params.value);
    } else {
      holderPositionEntity.shortBalance = holderPositionEntity.shortBalance.minus(event.params.value);
    }
    holderPositionEntity.save();

    // Update totalSupply
    positionEntity.totalSupply = positionEntity.totalSupply.minus(event.params.value);
    positionEntity.save();

    return
  }

  // Transfer action => Transfer(account, account, amount);
  // Register From Holder
  loadOrCreateHolderEntity(
    event.params.from,
    event.block.timestamp,
    event.transaction.hash
  );
  // Register To Holder
  loadOrCreateHolderEntity(
    event.params.to,
    event.block.timestamp,
    event.transaction.hash
  );
  let fromPositionEntity = loadOrCreateHolderPositionEntity(
    event.params.from,
    positionEntity.ticker
  );
  let toPositionEntity = loadOrCreateHolderPositionEntity(
    event.params.to,
    positionEntity.ticker
  );

  // Update Holders balances
  if (positionEntity.isLong) {
    fromPositionEntity.longBalance = fromPositionEntity.longBalance.minus(
      event.params.value
    );
    toPositionEntity.longBalance = toPositionEntity.longBalance.plus(
      event.params.value
    );
  } else {
    fromPositionEntity.shortBalance = fromPositionEntity.shortBalance.minus(
      event.params.value
    );
    toPositionEntity.shortBalance = toPositionEntity.shortBalance.plus(
      event.params.value
    );
  }
  fromPositionEntity.save();
  toPositionEntity.save();
}
