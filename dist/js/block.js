$(document).ready(async function () {
  hash = getQueryStringParam('hash')

  if (parseInt(hash).toString() === hash) {
    response = await fetch(ExplorerConfig.nodeURL + "chain/block/" + hash);
    _data = await response.text();
    hash = JSON.parse(_data).result.miningData.proof
    console.log(hash)
    
  }

      response = await fetch(ExplorerConfig.nodeURL + "chain/blockByHash/" + hash);
      _data = await response.text();
      $('#blockHeaderHash').text(hash)
      $('#blockHeight').text(JSON.parse(_data).result.height)
      $('#blockTime').text((new Date(JSON.parse(_data).result.timestamp * 1000)).toGMTString())
      $('#blockDiff').text(numeral(JSON.parse(_data).result.miningData.difficulty/1000/1000/1000).format('0,0.000') + ' B')
      $('#blockNonce').text(JSON.parse(_data).result.miningData.nonce)
      $('#blockMiner').text(JSON.parse(_data).result.miningData.miner)
      $('#blockReward').text(ExplorerConfig.blockReward + " " + ExplorerConfig.ticker)

      const transactions = $('#transactions').DataTable({
        columnDefs: [{
          targets: [0],
          searchable: false
        }, {
          targets: 0,
          render: function (data, type, row, meta) {
            if (type === 'display') {
              data = '<a href="./transaction.html?hash=' + data + '">' + data + '</a>'
            }
            return data
          }
        }],
        order: [
          [0, 'asc']
        ],
        searching: false,
        info: false,
        paging: false,
        lengthMenu: -1,
        language: {
          emptyTable: "No Transactions In This Block"
        },
        autoWidth: false
      }).columns.adjust().responsive.recalc()

      for (var i = 0; i < (JSON.parse(_data).result.transactions).length; i++) {
        var txn = JSON.parse(_data).result.transactions[i]

        transactions.row.add([
          txn
        ])
      }
      $("#transactionCount").text((JSON.parse(_data).result.transactions).length)
      transactions.draw(false)
    }
  )