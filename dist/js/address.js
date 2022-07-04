$(document).ready(async function () {
  addr = getQueryStringParam('address')


  var wait = (ms) => {
    var start = Date.now();
    while (Date.now() - start < ms) {
      Math.random();
    }
}

  function isAddr (str) {
    return (/^(0x){1}[0-9a-fA-F]{40}$/i.test(str));
  } 
  if (isAddr(addr)) {


      response = await fetch(ExplorerConfig.nodeURL + "accounts/accountInfo/" + addr);
      _data = await response.text();
      $('#accHeaderAddr').text(addr)
      $('#accBal').text(JSON.parse(_data).result.balance)

      // If bio is empty
      if (JSON.parse(_data).result.bio == "") {
      $('#accBio').text("None") }
      // If bio is not empty
      else {
        $('#accBio').text(JSON.parse(_data).result.bio)
      }

      const transactions = $('#transactions').DataTable({
        columnDefs: [{
          targets: [0, 1, 2, 3],
          searchable: false
        }, {
          targets: 4,
          render: function (data, type, row, meta) {
            if (type === 'display') {
              data = '<a href="./transaction.html?hash=' + data + '">' + data + '</a>'
            }
            return data
          }
        }],
        //order: 'asc',
        searching: false,
        info: false,
        paging: false,
        lengthMenu: -1,
        language: {
          emptyTable: "No Transactions On This Address"
        },
        autoWidth: false
      }).columns.adjust().responsive.recalc()



      const chunkSize = 50;
      const arr = (JSON.parse(_data).result.transactions).reverse();
      const groups = arr.map((e, i) => { 
     return i % chunkSize === 0 ? arr.slice(i, i + chunkSize) : null; 
    }).filter(e => { return e; });

    indx = 1
    $("#transactionCount").text((JSON.parse(_data).result.transactions).length-1)
    for (var l = 0; (l < (groups).length); l++) {
      response = await fetch(ExplorerConfig.nodeURL + "get/transactions/" + (groups[l]).toString());
      all_Txs = (await response.json())["result"]
      console.log(all_Txs)

      for (var i = 0; i < (all_Txs).length; i++) {
        __data = JSON.parse(all_Txs[i]["data"])
        var txn = all_Txs[i]["hash"]

        if (__data.type == 0) { _Type = "Transaction"; _To = __data.to; _Amount = __data.tokens; URL_link = "transaction.html?hash=" + txn}
        if (__data.type == 1) { _Type = "Miner Payout"; _To = JSON.parse(JSON.stringify(__data)).blockData.miningData.miner; _Amount = ExplorerConfig.blockReward; URL_link = "BlockTransaction.html?hash=" + txn }
        if (__data.type == 2) { _Type = "Web3 Transaction"; var tx = new ethereumjs.Tx(__data.rawTx); _To = '0x'+tx.to.toString('hex'); _Amount = parseInt(tx.value.toString('hex') || '0', 16) / (10**18); URL_link = "./Web3_Transaction.html?hash="+txn; }

        transactions.row.add([
          indx,
          _Type,
          _Amount + " " + ExplorerConfig.ticker,
          _To,
          txn
        ]) 
        transactions.draw(false)
        indx +=1
      }
      wait(100)
    }
    } }
  )