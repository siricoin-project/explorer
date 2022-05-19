$(document).ready(async function () {
  const hash = getQueryStringParam('hash')

response = await fetch(ExplorerConfig.nodeURL+"get/transaction/"+hash);
_data = await response.text();



TX_Type = JSON.parse(JSON.parse(_data).result.data).type

if (TX_Type == 1) {

$('#transactionHeaderHash').text(hash + " (Block transaction)")
$('#transactionFrom').text(JSON.parse(JSON.parse(_data).result.data).from)
$('#transactionTo').text(JSON.parse(JSON.parse(_data).result.data).to)
$('#transactionAmount').text(JSON.parse(JSON.parse(_data).result.data).tokens)
$('#transactionTime').text((new Date(JSON.parse(JSON.parse(_data).result.data).blockData.timestamp * 1000)).toGMTString())

blck_hash = JSON.parse((JSON.parse(_data).result.data)).blockData.miningData.proof

response = await fetch(ExplorerConfig.nodeURL+"chain/blockByHash/"+blck_hash);
_data = await response.text();
$('#blockHeight').text(JSON.parse(_data).result.height)
$('#blockHash').text(blck_hash)
$('#transactionMiner').text(JSON.parse(_data).result.miningData.miner)
$('#transactionReward').text(ExplorerConfig.blockReward + " " + ExplorerConfig.ticker)}

if (TX_Type == 0) { window.location.replace("./transaction.html?hash="+hash) }

})
