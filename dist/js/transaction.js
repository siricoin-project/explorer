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

if (JSON.parse(JSON.parse(xmlHttp.responseText).result.data).type == 1) { window.location.replace("./BlockTransaction.html?hash="+hash) }

if (JSON.parse(JSON.parse(xmlHttp.responseText).result.data).type == 0) {

  $('#transactionHeaderHash').text(hash)
  $('#transactionFrom').text(JSON.parse(JSON.parse(xmlHttp.responseText).result.data).from)
  $('#transactionTo').text(JSON.parse(JSON.parse(xmlHttp.responseText).result.data).to)
  $('#transactionAmount').text(JSON.parse(JSON.parse(xmlHttp.responseText).result.data).tokens)
  $('#transactionParent').text(JSON.parse(JSON.parse(xmlHttp.responseText).result.data).parent)
  /*$('#transactionAmount').text(numeral(txn.tx.amount_out / Math.pow(10, ExplorerConfig.decimalPoints)).format('0,0.00') + ' ' + ExplorerConfig.ticker)
  $('#blockHeight').html('<a href="./?search=' + txn.block.height + '">' + numeral(txn.block.height).format('0,0') + '</a>')
  $('#blockHash').html('<a href="./block.html?hash=' + txn.block.hash + '">' + txn.block.hash + '</a>')
  $('#transactionNonce').text(txn.tx.nonce)
  $('#transactionUnlockTime').text(numeral(txn.tx.unlock_time).format('0,0'))
  $('#transactionPublicKey').text(txn.tx.publicKey)
  $('#inputCount').text(txn.tx.inputs.length)
  $('#outputCount').text(txn.tx.outputs.length) */ }

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
