$(document).ready(async function () {
  const hash = getQueryStringParam('hash')

response = await fetch(ExplorerConfig.nodeURL+"get/transaction/"+hash);
_data = await response.text();

if (JSON.parse(JSON.parse(_data).result.data).type == 1) { window.location.replace("./BlockTransaction.html?hash="+hash) }

if (JSON.parse(JSON.parse(_data).result.data).type == 0) {

  $('#transactionHeaderHash').text(hash)
  $('#transactionFrom').text(JSON.parse(JSON.parse(_data).result.data).from)
  $('#transactionTo').text(JSON.parse(JSON.parse(_data).result.data).to)
  $('#transactionAmount').text(JSON.parse(JSON.parse(_data).result.data).tokens + " " + ExplorerConfig.ticker)
  $('#transactionParent').text(JSON.parse(JSON.parse(_data).result.data).parent)
}
})
