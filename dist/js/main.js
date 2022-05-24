var recentBlocks, topBlockHeight, blockchainChart, blockchainChartData, blockchainChartOptions

$(document).ready(async function () {
  checkForSearchTerm()

  blockchainChartOptions = {
    legend: {
      position: 'bottom'
    },
    vAxis: {
      scaleType: 'log',
      textPosition: 'none',
      gridlines: {
        count: 0
      },
      minorGridlines: {
        count: 0
      }
    },
    hAxis: {
      textPosition: 'none',
      gridlines: {
        count: 0
      },
      minorGridlines: {
        count: 0
      }
    },
    chartArea: {
      height: '75%',
      width: '100%',
    },
    vAxes: {
      0: {
        logScale: true
      },
      1: {
        logScale: false
      },
      2: {
        logScale: true
      },
      3: {
        logScale: true
      }
    },
    series: {
      0: {
        targetAxisIndex: 0
      },
      1: {
        targetAxisIndex: 1
      },
      2: {
        targetAxisIndex: 2
      },
      3: {
        targetAxisIndex: 3
      }
    },
    colors: ['#f6b26b', '#40c18e', '#8e7cc3', '#00853d', '#212721', '#fac5c3', '#6d9eeb', '#45818e', '#de5f5f']
  }

  localData.transactionPool = $('#transactionPool').DataTable({
    columnDefs: [{
      targets: 3,
      render: function(data, type) {
        if (type === 'display' && data.url) {
          const parts = data.name.split('.')
          while (parts.length > 2) {
            parts.shift()
          }
          data = '<a href="' + data.url + '" target="_blank">' + parts.join('.') + '</a>'
        } else if (type === 'display') {
          data = data.name
        }
        return data
      }
    }],
    order: [
      [0, 'desc']
    ],
    searching: false,
    info: false,
    paging: false,
    lengthMenu: -1,
    language: {
      emptyTable: "No recent tranactions found"
    },
    autoWidth: false
  }).columns.adjust().responsive.recalc()

  recentBlocks = $('#recentBlocks').DataTable({
    columnDefs: [{
      targets: 1,
      render: function (data, type) {
        if (type === 'display') {
          data = '<a href="./block.html?hash=' + data + '">' + data + '</a>'
        }
        return data
      }
    },{
      targets: 5,
      render: function(data, type) {
        if (type === 'display' && data.url) {
          const parts = data.name.split('.')
          while (parts.length > 2) {
            parts.shift()
          }
          data = '<a href="' + "data.url" + '" target="_blank">' + parts.join('.') + '</a>'
        } else if (type === 'display') {
          data = data.name
        }
        return data
      }
    }],
    order: [
      [0, 'desc']
    ],
    searching: false,
    info: false,
    paging: false,
    lengthMenu: -1,
    language: {
      emptyTable: "No recent blocks found"
    },
    autoWidth: false
  }).columns.adjust().responsive.recalc()

    getAndDisplayLastBlockHeader()

    function setLastBlockTimer() {
      setTimeout(function () {
        getAndDisplayLastBlockHeader()
        setLastBlockTimer()
      }, 15000)
    }
    setLastBlockTimer()

    updateTransactionPool(localData.transactionPool)

    function setTransactionPoolTimer() {
      setTimeout(function () {
        updateTransactionPool(localData.transactionPool)
        setTransactionPoolTimer()
      }, 15000)
    }
    setTransactionPoolTimer()
})

async function getAndDisplayLastBlockHeader() {
      response = await fetch(ExplorerConfig.nodeURL+"chain/length");
      _data = await response.text();
      __height = JSON.parse(_data).result
      if (__height !== topBlockHeight) {
        topBlockHeight = __height
        updateRecentBlocks(recentBlocks)
      }

      response = await fetch(ExplorerConfig.nodeURL+"stats");
      _data = await response.text();
      _stats = JSON.parse(_data)
      $('#blockchainHeight').text(__height)
      $('#blockchainDifficulty').text(new Intl.NumberFormat('en-GB', { notation: "compact", compactDisplay: "long" }).format(_stats.result.chain.difficulty))
      $('#blockchainReward').text(ExplorerConfig.blockReward + " " + ExplorerConfig.ticker)
      $('#blockchainTransactions').text(_stats.result.coin.transactions)
      $('#blockchainCirculatingSupply').text(_stats.result.coin.supply + " " + ExplorerConfig.ticker)
      $('#blockchainTotalSupply').text(new Intl.NumberFormat('en-GB', { notation: "compact", compactDisplay: "long" }).format(ExplorerConfig.maxSupply) + " " + ExplorerConfig.ticker)
    }
  

async function updateTransactionPool(table) {
      table.clear()
      response = await fetch(ExplorerConfig.nodeURL+"get/nLastTxs/10");
      _data = await response.text();
      ____transactions = JSON.parse(_data)

      i = ____transactions.result.length; ctn = true
      while (ctn) {
        i = i-1
        if(i == -1) {ctn = false; break;}
        ____result = ____transactions.result[i];
        ____hash = ____result.hash;
        ____dataJSON = JSON.parse(____result.data);
        if (____dataJSON.type == 2) { _Type = "Web3 Transaction"; var tx = new ethereumjs.Tx(____dataJSON.rawTx); _To = '0x'+tx.to.toString('hex').toUpperCase(); _Amount = parseInt(tx.value.toString('hex') || '0', 16) / (10**18); URL_link = "./Web3_Transaction.html?hash="+____hash; }
        if (____dataJSON.type == 1) { _Type = "Miner Payout"; _To = JSON.parse(JSON.stringify(____dataJSON)).blockData.miningData.miner; _Amount = ExplorerConfig.blockReward; URL_link = "BlockTransaction.html?hash=" + ____hash }
        if (____dataJSON.type == 0) { _Type = "Transaction"; _To = ____dataJSON.to.toUpperCase(); _Amount = ____dataJSON.tokens; URL_link = "transaction.html?hash=" + ____hash}

        table.row.add([
          _Type,
          _Amount + " " + ExplorerConfig.ticker,
          _To,
          {
            url: URL_link,
            name: ____hash
          }
        ]) 

        $("#transactionPoolCount").text(____transactions.result.length)
    }
 
    table.draw(false)
    

    checkForSearchTerm()

      }

    


async function updateRecentBlocks(table) {
      table.clear()
      response = await fetch(ExplorerConfig.nodeURL+"chain/length");
      _data = await response.text();
      
      Block_Height = JSON.parse(_data).result

      for (var i = 0; i < 10; i++) {
        Block_to_Search = Block_Height-i-1
        response = await fetch(ExplorerConfig.nodeURL+"chain/block/"+Block_to_Search);
        _data = await response.text();
        
        Block_Data = JSON.parse(_data)
        

        table.row.add([
          numeral(Block_Data.result.height).format('0,0'),
          Block_Data.result.miningData.proof,
          numeral(Block_Data.result.miningData.difficulty/1000/1000/1000).format('0,0.000') + ' B',
          numeral(Object.keys(Block_Data.result.transactions).length).format('0,0'),
          (new Date(Block_Data.result.timestamp * 1000)).toLocaleTimeString(),
          {
            url: "",
            name: Block_Data.result.miningData.miner
          }
        ])
      }
      table.draw(false)
      $("#BlockCount").text(i)
    }
