$(document).ready(async function () {
    const hash = getQueryStringParam('hash')
  
  response = await fetch(ExplorerConfig.nodeURL+"get/transaction/"+hash);
  _data = await response.text();
  
  if (JSON.parse(JSON.parse(_data).result.data).type == 1) { window.location.replace("./BlockTransaction.html?hash="+hash) }

  if (JSON.parse(JSON.parse(_data).result.data).type == 0) { window.location.replace("./transaction.html?hash="+hash) }
  
  if (JSON.parse(JSON.parse(_data).result.data).type == 2) {
    
    
    var tx = new ethereumjs.Tx(JSON.parse(JSON.parse(_data).result.data).rawTx);


    from = '0x'+tx.from.toString('hex');
    to = '0x'+tx.to.toString('hex');
    amount = parseInt(tx.value.toString('hex') || '0', 16) / (10**18)


    $('#transactionHeaderHash').text(hash + " (Web3 Transaction)")
    $('#transactionFrom').text(from)
    $('#transactionTo').text(to)
    $('#transactionAmount').text(amount + " " + ExplorerConfig.ticker)
  }
  })
  