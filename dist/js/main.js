var recentBlocks, topBlockHeight, blockchainChart, blockchainChartData, blockchainChartOptions

var xmlHttp = new XMLHttpRequest();

$(document).ready(function () {
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
          data = '<a href="./block.html?hash=' + data + '">' + data + '</a>' // TODO: UPDATE BLOCK 
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

  google.charts.setOnLoadCallback(function () {
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
})

function getAndDisplayLastBlockHeader() {

      xmlHttp.open( "GET", ExplorerConfig.nodeURL+"chain/length", false );
      xmlHttp.send()
      __height = JSON.parse(xmlHttp.responseText).result
      if (__height !== topBlockHeight) {
        topBlockHeight = __height
        updateRecentBlocks(recentBlocks)
      }

      xmlHttp.open( "GET", ExplorerConfig.nodeURL+"stats", false );
      xmlHttp.send()
      _stats = JSON.parse(xmlHttp.responseText)
      $('#blockchainHeight').text(__height)
      $('#blockchainDifficulty').text(new Intl.NumberFormat('en-GB', { notation: "compact", compactDisplay: "long" }).format(_stats.result.chain.difficulty))
      $('#blockchainReward').text(ExplorerConfig.blockReward)
      $('#blockchainTransactions').text(_stats.result.coin.transactions)
      $('#blockchainCirculatingSupply').text(_stats.result.coin.supply)
      $('#blockchainTotalSupply').text(new Intl.NumberFormat('en-GB', { notation: "compact", compactDisplay: "long" }).format(ExplorerConfig.maxSupply))
    }
  

function updateTransactionPool(table) {
      table.clear()
      xmlHttp.open( "GET", ExplorerConfig.nodeURL+"get/nLastTxs/10", false );
      xmlHttp.send()
      _transactions = JSON.parse(xmlHttp.responseText)

      for (var i = 0; i < _transactions.result.length; i++) {

        const result = _transactions.result[i];
        const hash = result.hash;
        const dataJSON = JSON.parse(result.data);
        if (dataJSON.type == 1) { _Type = "Miner Payout"; _To = JSON.parse(JSON.stringify(dataJSON)).blockData.miningData.miner; _Amount = ExplorerConfig.blockReward }
        if (dataJSON.type == 0) { _Type = "Transaction"; _To = dataJSON.to; _Amount = dataJSON.tokens }

        table.row.add([
          _Type,
          _Amount,
          _To,
          {
            url: "transaction.html?hash=" + hash,
            name: hash
          }
        ]) 

    
    }
 
    table.draw(false)

    checkForSearchTerm()

      }

    


function updateRecentBlocks(table) {
      table.clear()
      xmlHttp.open( "GET", ExplorerConfig.nodeURL+"chain/length", false );
      xmlHttp.send()
      Block_Height = JSON.parse(xmlHttp.responseText).result

      for (var i = 0; i < 10; i++) {
        Block_to_Search = Block_Height-i-1
        xmlHttp.open( "GET", ExplorerConfig.nodeURL+"chain/block/"+Block_to_Search, false );
        xmlHttp.send()
        Block_Data = JSON.parse(xmlHttp.responseText)
        

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
    }
