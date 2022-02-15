import {
  Transfer,
  OpiumPositionToken,
} from "../generated/OpiumProxyFactory/OpiumPositionToken";
import { LogPositionTokenPair } from "../generated/OpiumProxyFactory/OpiumProxyFactory";
import { OpiumPositionToken as OpiumPositionTokenTemplate } from "../generated/templates";
import {
  isZeroAddress,
  loadOrCreateHolderEntity,
  loadOrCreatePositionBalanceEntity,
  loadOrCreatePositionEntity,
  loadOrCreateTickerEntity,
} from "../utils/index";

export function handleLogPositionTokenPair(event: LogPositionTokenPair): void {
  let tickerEntity = loadOrCreateTickerEntity(
    event.params._derivativeHash,
    event.params._longPositionAddress,
    event.params._shortPositionAddress,
    event.block.timestamp,
    event.transaction.hash
  );
  
  let longPositionEntity = loadOrCreatePositionEntity(
    event.params._longPositionAddress
  );
  let shortPositionEntity = loadOrCreatePositionEntity(
    event.params._shortPositionAddress
  );

  longPositionEntity.save();
  shortPositionEntity.save();
  tickerEntity.save();

  // initializes the OpiumPositionToken templates
  OpiumPositionTokenTemplate.create(event.params._longPositionAddress);
  OpiumPositionTokenTemplate.create(event.params._shortPositionAddress);
}

export function handleTransfer(event: Transfer): void {
  // mint event => Transfer(address(0), account, amount);
  const derivativeData = OpiumPositionToken.bind(
    event.address
  ).getPositionTokenData();
  if (isZeroAddress(event.params.from) && !isZeroAddress(event.params.to)) {
    let holderEntity = loadOrCreateHolderEntity(
      event.params.to,
      event.block.timestamp,
      event.transaction.hash
    );
    let positionEntity = loadOrCreatePositionBalanceEntity(
      event.params.to,
      event.address,
      derivativeData.derivativeHash
    );

    positionEntity.balance = positionEntity.balance.plus(event.params.value);
    positionEntity.save();
    holderEntity.save();
  }
  // burn event => Transfer(account, address(0), amount);
  if (!isZeroAddress(event.params.from) && isZeroAddress(event.params.to)) {
    let holderEntity = loadOrCreateHolderEntity(
      event.params.from,
      event.block.timestamp,
      event.transaction.hash
    );
    let positionEntity = loadOrCreatePositionBalanceEntity(
      event.params.from,
      event.address,
      derivativeData.derivativeHash
    );

    positionEntity.balance = positionEntity.balance.minus(event.params.value);
    positionEntity.save();
    holderEntity.save();
  }
  // transfer action => Transfer(account, account, amount);
  if (!isZeroAddress(event.params.from) && !isZeroAddress(event.params.to)) {
    let buyerEntity = loadOrCreateHolderEntity(
      event.params.from,
      event.block.timestamp,
      event.transaction.hash
    );
    let sellerEntity = loadOrCreateHolderEntity(
      event.params.to,
      event.block.timestamp,
      event.transaction.hash
    );
    let positionEntityBuyer = loadOrCreatePositionBalanceEntity(
      event.params.from,
      event.address,
      derivativeData.derivativeHash
    );
    let positionEntitySeller = loadOrCreatePositionBalanceEntity(
      event.params.to,
      event.address,
      derivativeData.derivativeHash
    );

    positionEntityBuyer.balance = positionEntityBuyer.balance.plus(
      event.params.value
    );
    positionEntitySeller.balance = positionEntitySeller.balance.minus(
      event.params.value
    );
    positionEntityBuyer.save();
    positionEntitySeller.save();
    buyerEntity.save();
    sellerEntity.save();
  }
}
