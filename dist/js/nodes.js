nodes = [{
  "name": "Main-net",
  "protocol": "https",
  "URL": "node-1.siricoin.tech:5006"
}, {
  "name": "Junaid shard chain",
  "protocol": "https",
  "URL": "node-2.siricoin.tech:5006"
},
{
  "name": "Yanis shard chain",
  "protocol": "https",
  "URL": "sirinode1.raptorchain.io:443"
}
]

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
            data = '<span title="' + data.address + '"><img src=./dist/img/node.svg width="23" height="23" style="vertical-align: middle;"></img> ' + "⠀" + data.name
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
      [2, 'dsc']
    ],
    autoWidth: false
  }).columns.adjust().responsive.recalc().draw(false)


getAndDrawNodeStats()
})

async function getAndDrawNodeStats () {


      

      localData.nodeTable.clear()
      for (var i = 0; i < nodes.length; i++) {


        var node = nodes[i]

        if (node.protocol == "https") {_https = true} else {_https = false}

        response = await fetch(node.protocol + "://" + node.URL+"/stats");
        _data = await response.text();

        
        _height = JSON.parse(_data).result.chain.length
        _txs = JSON.parse(_data).result.coin.transactions

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

