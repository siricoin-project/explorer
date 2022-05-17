nodes = [{
  "name": "Main-net",
  "protocol": "https",
  "URL": "node-1.siricoin.tech:5006"
}, {
  "name": "Junaid shard chain",
  "protocol": "http",
  "URL": "47.250.59.81:5005"
}]

var xmlHttp = new XMLHttpRequest();

$(document).ready(function () {
  localData.nodeTable = $('#nodes').DataTable({
    searching: false,
    info: false,
    paging: false,
    lengthMenu: -1,
    language: {
      emptyTable: 'No Nodes Found'
    },
    columnDefs: [
      {
        targets: [0],
        render: function (data, type, row, meta) {
          if (type === 'display') {
            data = '<span title="' + data.address + '"><svg data-jdenticon-value="' + data.address + '" width="20" height="20" style="vertical-align: middle;"></svg> ' + data.name
          } else if (type === 'sort') {
            data = data.name
          }
          return data
        }
      },
      {
        targets: [1],
        render: function (data, type, row, meta) {
          if (type === 'display') {
            data = data.host + ':' + data.port + data.ssl + data.cache
          } else if (type === 'sort') {
            data = data.host + ':' + data.port
          }
          return data
        }
      },
    ],
    order: [
      [0, 'dsc']
    ],
    autoWidth: false
  }).columns.adjust().responsive.recalc().draw(false)


getAndDrawNodeStats()
})

function getAndDrawNodeStats () {


      

      localData.nodeTable.clear()
      for (var i = 0; i < nodes.length; i++) {


        var node = nodes[i]
        console.log(node.URL)

        hist = []

        if (node.protocol == "https") {_https = true} else {_https = false}

        xmlHttp.open( "GET", node.protocol + "://" + node.URL+"/stats", false );
        xmlHttp.send()
        
        _height = JSON.parse(xmlHttp.responseText).result.chain.length
        _txs = JSON.parse(xmlHttp.responseText).result.coin.transactions

        localData.nodeTable.row.add([
          {
            name: node.name + "",
            address: node.protocol + "://" + node.URL
          },
          {
            host: (node.URL).split(':')[0],
            port: (node.URL).split(':')[1],
            ssl: _https ? ' <i class="fas fa-user-shield has-trtl-green" title="HTTPS"></i>' : '',
            cache: false ? ' <i class="fas fa-tachometer-alt has-trtl-green" title="Blockchain Cache"></i>' : ''
          },
          _height,
          _txs
        ])
      }
      localData.nodeTable.draw(false)
      jdenticon()
    }
  setTimeout(() => {
    getAndDrawNodeStats()
  }, 15000)

