const localData = {}

$(document).ready(function () {
  $('#searchButton').click(function () {
    searchForTerm($('#searchValue').val())
  })

  $('#searchValue').keydown(function (e) {
    setSearchValueErrorState(false)
    if (e.which === 13) {
      searchForTerm($('#searchValue').val())
    }
  })

  $('.navbar-burger').click(function () {
    $('.navbar-burger').toggleClass('is-active')
    $('.navbar-menu').toggleClass('is-active')
  })
})

function checkForSearchTerm () {
  const searchTerm = getQueryStringParam('search')
  /* If we were given a search term, let's plug it in
     and then run a search for them */
  if (searchTerm && searchTerm.length !== 0) {
    $('#searchValue').val(searchTerm)
    searchForTerm(searchTerm)
  }
}


function isHash (str) {
  const regex = new RegExp('^[0-9a-fA-F]{64}$')
  return regex.test(str.replace("0x", ""))
}

async function searchForTerm (term) {
  term = term.trim()
  /* Allow commas in a height search */
  term = term.replace(',', '')


  // Check if block height
  if (parseInt(term).toString() === term) {
    window.location.href = "./block.html?hash="+term
    
  } 
  else {
    // If it's a hash of some sort
    if (isHash(term)) {

      if (!term.startsWith("0x")) { term = "0x" + term }
      response = await fetch(ExplorerConfig.nodeURL + "get/transaction/"+term);
      _data = await response.text();



      // If a transaction was found
      if (JSON.parse(_data).success) {
        if (JSON.parse(JSON.parse(_data).result.data).type == 0) {window.location.href = "./transaction.html?hash="+term;}
        if (JSON.parse(JSON.parse(_data).result.data).type == 1) {window.location.href = "./BlockTransaction.html?hash="+term;}
        //if (JSON.parse(JSON.parse(_data).result.data).type == 2) {console.log("It's a 2")}
      } 
      // If a transaction wasn't found, look for a block
      else {
        response = await fetch(ExplorerConfig.nodeURL + "chain/blockByHash/"+term);
        _data = await response.text();

        // If block was found
        if (JSON.parse(_data).success) {
          window.location.href = "./block.html?hash="+term
        }

      }


    }
  } 
}

function setSearchValueErrorState (state) {
  if (state) {
    $('#searchValue').removeClass('is-danger').addClass('is-danger')
  } else {
    $('#searchValue').removeClass('is-danger')
  }
}

function getQueryStringParam (key) {
  const queryString = window.location.search.substring(1)
  const params = queryString.split('&')
  for (var i = 0; i < params.length; i++) {
    var param = params[i].split('=')
    if (param[0] === key) {
      return param[1]
    }
  }
}

function secondsToHumanReadable (seconds) {
  var days = Math.floor(seconds / (3600 * 24))
  seconds -= days * 3600 * 24
  var hrs = Math.floor(seconds / 3600)
  seconds -= hrs * 3600
  var mnts = Math.floor(seconds / 60)
  seconds -= mnts * 60

  return {
    days: days,
    hours: hrs,
    minutes: mnts,
    seconds: seconds
  }
}
