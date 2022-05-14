var xmlHttp = new XMLHttpRequest();
$(document).ready(function () {
  const hash = getQueryStringParam('hash')
  const keyImage = getQueryStringParam('keyImage')



  $('#checkTransaction').click(function () {
    checkTransaction()
  })

  $('#privateViewKey').keydown(function (e) {
    setPrivateViewKeyState(false)
    if (e.which === 13) {
      checkTransaction()
    }
  })

  $('#recipientAddress').keydown(function (e) {
    setRecipientAddressState(false)
    if (e.which === 13) {
      checkTransaction()
    }
  })

  window.cnUtils = new TurtleCoinUtils.CryptoNote({
    coinUnitPlaces: ExplorerConfig.decimalPoints,
    addressPrefix: ExplorerConfig.addressPrefix
  })


xmlHttp.open( "GET", ExplorerConfig.nodeURL+"get/transaction/"+hash, false );
xmlHttp.send()

TX_Type = JSON.parse(JSON.parse(xmlHttp.responseText).result.data).type

if (TX_Type == 1) {

$('#transactionHeaderHash').text(hash + " (Block transaction)")
$('#transactionFrom').text(JSON.parse(JSON.parse(xmlHttp.responseText).result.data).from)
$('#transactionTo').text(JSON.parse(JSON.parse(xmlHttp.responseText).result.data).to)
$('#transactionAmount').text(JSON.parse(JSON.parse(xmlHttp.responseText).result.data).tokens)
$('#transactionTime').text((new Date(JSON.parse(JSON.parse(xmlHttp.responseText).result.data).blockData.timestamp * 1000)).toGMTString())

blck_hash = JSON.parse((JSON.parse(xmlHttp.responseText).result.data)).blockData.miningData.proof

xmlHttp.open( "GET", ExplorerConfig.nodeURL+"chain/blockByHash/"+blck_hash, false );
xmlHttp.send()
$('#blockHeight').text(JSON.parse(xmlHttp.responseText).result.height)
$('#blockHash').text(blck_hash)
$('#transactionMiner').text(JSON.parse(xmlHttp.responseText).result.miningData.miner)
$('#transactionReward').text(ExplorerConfig.blockReward + " " + ExplorerConfig.ticker)
/*$('#transactionUnlockTime').text(numeral(txn.tx.unlock_time).format('0,0'))
$('#transactionPublicKey').text(txn.tx.publicKey)
$('#inputCount').text(txn.tx.inputs.length)
$('#outputCount').text(txn.tx.outputs.length) */ }

if (TX_Type == 0) { window.location.replace("./transaction.html?hash="+hash) }

async function checkTransaction() {
  var recipient = $('#recipientAddress').val()
  var key = $('#key').val()
  var txnPublicKey = $('#transactionPublicKey').text()

  localData.outputs.rows().every(function (idx, tableLoop, rowLoop) {
    $(localData.outputs.row(idx).nodes()).removeClass('is-ours')
  })

  if (!isHash(key)) {
    setPrivateViewKeyState(true)
  }

  var address;

  try {
    address = await TurtleCoinUtils.Address.fromAddress(recipient)
    if (!address) {
      setRecipientAddressState(true)
      return
    }
  } catch (e) {
    setRecipientAddressState(true)
    return
  }

  var totalOwned = 0
  localData.outputs.rows().every(async function (idx, tableLoop, rowLoop) {
    var data = this.data()
    var owned = await checkOutput(txnPublicKey, key, address, {
      index: idx,
      key: data[1]
    })
    if (owned) {
      totalOwned = totalOwned + parseInt(data[0])
      $(localData.outputs.row(idx).nodes()).addClass('is-ours')
      $('#ourAmount').text(': Found ' + numeral(totalOwned / Math.pow(10, ExplorerConfig.decimalPoints)).format('0,0.00') + ' ' + ExplorerConfig.ticker)
    }
  })
}

async function checkOutput(transactionPublicKey, key, address, output) {
  let isOursTxnPublicKey;
  try {
    isOursTxnPublicKey = await cnUtils.isOurTransactionOutput(transactionPublicKey, output, key, address.spend.publicKey)
  } catch (e) {}

  let isOursTxnPrivKey;
  try {
    isOursTxnPrivKey = await cnUtils.isOurTransactionOutput(address.view.publicKey, output, key, address.spend.publicKey)
  } catch (e) {}

  return (isOursTxnPublicKey || isOursTxnPrivKey)
}

function setPrivateViewKeyState(state) {
  if (state) {
    $('#privateViewKey').removeClass('is-danger').addClass('is-danger')
  } else {
    $('#privateViewKey').removeClass('is-danger')
  }
}

})
