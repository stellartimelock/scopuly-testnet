// Shared build logic (browser: window.StellarSdk; node: require)
(function(root){
const CFG={
  contract:'CAHAQAN6KYAQCJ34W6CVZJGMWRXKCZFHM32F37E4EFEIIC4636TD74BV',
  source:'GAK2FTR2BVC35RME3D77V2YND3RVPGCXSXBBCS4UMHIJHLXKXYK27GGP',
  vaultId:22, fn:'ping', msg:'Check in on vault 22',
  horizon:'https://horizon-testnet.stellar.org', rpc:'https://soroban-testnet.stellar.org',
  timeoutSec:1800
};
async function buildPing(S){
  const pass=S.Networks.TESTNET;
  const horizon=new S.Horizon.Server(CFG.horizon);
  const rpc=new S.rpc.Server(CFG.rpc);
  const acct=await horizon.loadAccount(CFG.source);           // fresh sequence
  const c=new S.Contract(CFG.contract);
  const tx=new S.TransactionBuilder(acct,{fee:S.BASE_FEE,networkPassphrase:pass})
    .addOperation(c.call(CFG.fn,new S.Address(CFG.source).toScVal(),S.nativeToScVal(CFG.vaultId,{type:'u64'})))
    .setTimeout(CFG.timeoutSec).build();                       // fresh timebounds
  const prepared=await rpc.prepareTransaction(tx);             // simulate: footprint, auth, resource fee
  const xdr=prepared.toXDR();                                  // unsigned
  const q=new URLSearchParams({xdr,network_passphrase:pass,pubkey:CFG.source,msg:CFG.msg});
  return {xdr,uri:'web+stellar:tx?'+q.toString(),tx:prepared};
}
root.STL={CFG,buildPing};
})(typeof window!=='undefined'?window:globalThis);
