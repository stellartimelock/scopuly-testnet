// Shared build logic (browser: window.StellarSdk; node: require). Testnet only, unsigned, no keys.
(function(root){
const CFG={
  contract:'CAHAQAN6KYAQCJ34W6CVZJGMWRXKCZFHM32F37E4EFEIIC4636TD74BV',
  source:'GAK2FTR2BVC35RME3D77V2YND3RVPGCXSXBBCS4UMHIJHLXKXYK27GGP', // default sample account (owner of vault 22)
  vaultId:22, backup:'GAK2FTR2BVC35RME3D77V2YND3RVPGCXSXBBCS4UMHIJHLXKXYK27GGP',
  createAmount:1, inactivitySec:3600, // 1 stroop (0.0000001 testnet XLM), 1-hour check-in window
  horizon:'https://horizon-testnet.stellar.org', rpc:'https://soroban-testnet.stellar.org', timeoutSec:1800
};
function srv(S){return {h:new S.Horizon.Server(CFG.horizon),rpc:new S.rpc.Server(CFG.rpc),pass:S.Networks.TESTNET}}
function uri(S,xdr,account,msg){return 'web+stellar:tx?'+new URLSearchParams({xdr,network_passphrase:S.Networks.TESTNET,pubkey:account,msg}).toString()}
async function prep(S,account,fn,args){const {h,rpc,pass}=srv(S);const acct=await h.loadAccount(account);
  const tx=new S.TransactionBuilder(acct,{fee:S.BASE_FEE,networkPassphrase:pass}).addOperation(new S.Contract(CFG.contract).call(fn,...args)).setTimeout(CFG.timeoutSec).build();
  const sim=await rpc.simulateTransaction(tx);if(S.rpc.Api.isSimulationError(sim))throw new Error('Simulation failed: '+String(sim.error).split('\n')[0]);
  const p=S.rpc.assembleTransaction(tx,sim).build();return {tx:p,xdr:p.toXDR(),ret:sim.result&&sim.result.retval?S.scValToNative(sim.result.retval):null}}
async function listOwned(S,account){const {h,rpc,pass}=srv(S);const acct=await h.loadAccount(account);
  const tx=new S.TransactionBuilder(acct,{fee:'100',networkPassphrase:pass}).addOperation(new S.Contract(CFG.contract).call('list_owned',new S.Address(account).toScVal())).setTimeout(60).build();
  const sim=await rpc.simulateTransaction(tx);if(S.rpc.Api.isSimulationError(sim))return [];return (S.scValToNative(sim.result.retval)||[]).map(Number)}
async function buildCreate(S,account){account=account||CFG.source;
  const xlm=S.Asset.native().contractId(S.Networks.TESTNET);
  const backup=account===CFG.backup?'GAUD4W4CPJOYSH77CGYTGQVNKXHYST5Z5XGWXKHYGCPKIY4DSJKZAFEV':CFG.backup;
  const r=await prep(S,account,'create_dead_man_switch_vault',[new S.Address(account).toScVal(),new S.Address(xlm).toScVal(),S.nativeToScVal('Scopuly test',{type:'string'}),S.nativeToScVal(CFG.createAmount,{type:'i128'}),new S.Address(backup).toScVal(),S.nativeToScVal(CFG.inactivitySec,{type:'u64'})]);
  const id=Number(r.ret);return {...r,expectedVaultId:id,uri:uri(S,r.xdr,account,'Create Testnet test vault (expected id '+id+')')}}
async function buildPing(S,account,vaultId){account=account||CFG.source;vaultId=Number(vaultId==null?CFG.vaultId:vaultId);
  const r=await prep(S,account,'ping',[new S.Address(account).toScVal(),S.nativeToScVal(vaultId,{type:'u64'})]);
  return {...r,vaultId,uri:uri(S,r.xdr,account,'Check in on vault '+vaultId)}}
root.STL={CFG,buildPing,buildCreate,listOwned};
})(typeof window!=='undefined'?window:globalThis);
