import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface ApproveMintedTokens {
  'approve_spender' : string,
  'principal_signature' : Signature,
  'approve_amount' : string,
}
export interface BuildData {
  'rustc_semver' : string,
  'git_branch' : string,
  'pkg_version' : string,
  'cargo_target_triple' : string,
  'cargo_debug' : string,
  'pkg_name' : string,
  'cargo_features' : string,
  'build_timestamp' : string,
  'git_sha' : string,
  'git_commit_timestamp' : string,
}
export type Error = { 'Internal' : string } |
  { 'InvalidNonce' : { 'got' : bigint, 'minimum' : bigint } } |
  { 'InvalidTokenAddress' : null } |
  { 'BftBridgeAlreadyRegistered' : string } |
  { 'Icrc2TransferFromError' : TransferFromError } |
  { 'Icrc2TransferError' : TransferError } |
  { 'NotAuthorized' : null } |
  { 'AnonymousPrincipal' : null } |
  { 'BftBridgeDoesNotExist' : null } |
  { 'JsonRpcCallFailed' : string } |
  { 'InsufficientOperationPoints' : { 'got' : number, 'expected' : number } } |
  { 'InterCanisterCallFailed' : [RejectionCode, string] } |
  { 'InvalidBftBridgeContract' : null } |
  { 'InvalidBurnOperation' : string };
export interface HttpHeader { 'value' : string, 'name' : string }
export interface HttpResponse {
  'status' : bigint,
  'body' : Uint8Array | number[],
  'headers' : Array<HttpHeader>,
}
export interface Icrc2Burn {
  'approve_minted_tokens' : [] | [ApproveMintedTokens],
  'operation_id' : number,
  'from_subaccount' : [] | [Uint8Array | number[]],
  'icrc2_token_principal' : Principal,
  'recipient_address' : string,
  'fee_payer' : [] | [string],
  'amount' : string,
}
export interface InitData {
  'evm_principal' : Principal,
  'signing_strategy' : SigningStrategy,
  'owner' : Principal,
  'log_settings' : [] | [LogSettings],
}
export type Interval = { 'PerHour' : null } |
  { 'PerWeek' : null } |
  { 'PerDay' : null } |
  { 'Period' : { 'seconds' : bigint } } |
  { 'PerMinute' : null };
export interface Log { 'log' : string, 'offset' : bigint }
export interface LogSettings {
  'log_filter' : [] | [string],
  'in_memory_records' : [] | [bigint],
  'enable_console' : boolean,
}
export interface Logs { 'logs' : Array<Log>, 'all_logs_count' : bigint }
export interface MetricsData {
  'stable_memory_size' : bigint,
  'cycles' : bigint,
  'heap_memory_size' : bigint,
}
export interface MetricsMap {
  'map' : Array<[bigint, MetricsData]>,
  'interval' : Interval,
  'history_length_nanos' : bigint,
}
export interface MetricsStorage { 'metrics' : MetricsMap }
export type RejectionCode = { 'NoError' : null } |
  { 'CanisterError' : null } |
  { 'SysTransient' : null } |
  { 'DestinationInvalid' : null } |
  { 'Unknown' : null } |
  { 'SysFatal' : null } |
  { 'CanisterReject' : null };
export type Result = { 'Ok' : number } |
  { 'Err' : Error };
export type Result_1 = { 'Ok' : string } |
  { 'Err' : Error };
export type Result_2 = { 'Ok' : Logs } |
  { 'Err' : Error };
export type Result_3 = { 'Ok' : null } |
  { 'Err' : Error };
export interface Signature { 'r' : string, 's' : string, 'v' : string }
export type SigningKeyId = { 'Dfx' : null } |
  { 'Production' : null } |
  { 'Test' : null } |
  { 'PocketIc' : null } |
  { 'Custom' : string };
export type SigningStrategy = {
    'Local' : { 'private_key' : Uint8Array | number[] }
  } |
  { 'ManagementCanister' : { 'key_id' : SigningKeyId } };
export type TransferError = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : null } |
  { 'BadBurn' : { 'min_burn_amount' : bigint } } |
  { 'Duplicate' : { 'duplicate_of' : bigint } } |
  { 'BadFee' : { 'expected_fee' : bigint } } |
  { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
  { 'TooOld' : null } |
  { 'InsufficientFunds' : { 'balance' : bigint } };
export type TransferFromError = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : null } |
  { 'InsufficientAllowance' : { 'allowance' : bigint } } |
  { 'BadBurn' : { 'min_burn_amount' : bigint } } |
  { 'Duplicate' : { 'duplicate_of' : bigint } } |
  { 'BadFee' : { 'expected_fee' : bigint } } |
  { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
  { 'TooOld' : null } |
  { 'InsufficientFunds' : { 'balance' : bigint } };
export interface TransformArgs {
  'context' : Uint8Array | number[],
  'response' : HttpResponse,
}
export interface _SERVICE {
  'burn_icrc2' : ActorMethod<[Icrc2Burn], Result>,
  'get_bft_bridge_contract' : ActorMethod<[], [] | [string]>,
  'get_canister_build_data' : ActorMethod<[], BuildData>,
  'get_curr_metrics' : ActorMethod<[], MetricsData>,
  'get_evm_principal' : ActorMethod<[], Principal>,
  'get_metrics' : ActorMethod<[], MetricsStorage>,
  'get_mint_order' : ActorMethod<
    [Uint8Array | number[], Uint8Array | number[], number],
    [] | [Uint8Array | number[]]
  >,
  'get_minter_canister_evm_address' : ActorMethod<[], Result_1>,
  'get_owner' : ActorMethod<[], Principal>,
  'ic_logs' : ActorMethod<[bigint, bigint], Result_2>,
  'init_bft_bridge_contract' : ActorMethod<[], Result_1>,
  'list_mint_orders' : ActorMethod<
    [Uint8Array | number[], Uint8Array | number[]],
    Array<[number, Uint8Array | number[]]>
  >,
  'set_evm_principal' : ActorMethod<[Principal], Result_3>,
  'set_logger_filter' : ActorMethod<[string], Result_3>,
  'set_owner' : ActorMethod<[Principal], Result_3>,
  'transform' : ActorMethod<[TransformArgs], HttpResponse>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
