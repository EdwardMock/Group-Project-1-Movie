var userSearch = ""
var searchHistory = []
var watchModeID = ""
var searchList = document.getElementById('search-list')
var movieQuote = document.getElementById('movie-quote')
var movieQuotePerson = document.getElementById('movie-quote-person')
var movieTitle = document.getElementById('movie-title')
var titleMovie = document.getElementById('title-movie')
var movieRating = document.getElementById('ratings')
var movieSummary = document.getElementById('movie-summary')
var moviePoster = document.getElementById('movie-poster')
var movieAvailability = document.getElementById('movie-availability')
var movieAvailabilityUrl = document.getElementById('movie-availabilty-url')
var networkList = document.getElementById('network-list')
var embeddedTrailer = document.getElementById('embedded-trailer')
var welcomeInfo = document.getElementById('welcome-info')
var apiInfo = document.getElementById('api-info')
var noMovieInput = document.getElementById('no-movie-input')
var alertButton = document.getElementById('alert-button')
var searchBar = document.getElementById('search-bar')
var trailerButton = document.getElementById('trailer-button')
const movieList = document.getElementById("movie-list")
var networkList = document.getElementById('network-list')
var savedTrailer

//Get User Input
document.getElementById('search_button').addEventListener('click', userInputComplete)
document.getElementById('search_field').addEventListener('keyup', (e) => e.target.value = e.target.value.trimStart())
$('#search-bar').on('submit', (e) => { e.preventDefault(); return false })

$('#trailer-modal').on('open.zf.reveal', (e) => {
  embeddedTrailer.src = savedTrailer
  console.log(embeddedTrailer.src)
})
$('#trailer-modal').on('closed.zf.reveal', (e) => {
  embeddedTrailer.src = ""
  console.log(embeddedTrailer.src)
})

$('#movie-list').on('click', (e) => {
  $('#search_field').val(e.target.innerText)
  userSearch = e.target.innerText
  console.log(e.target)
  callWatchMode()
})


saveSearchHistory()


function userInputComplete(e) {
  e.preventDefault()
  userSearch = document.getElementById('search_field').value
  userSearch = userSearch.trim()
  saveSearchHistory()
  callWatchMode()
}

/*API Calls*/
//WatchMode API Calls
async function callWatchMode() {
  const movieInfoData = getFromCache(userSearch)
  if (movieInfoData) {
    updateSearch(movieInfoData)
  } else {
    const url = (
      'https://api.watchmode.com/v1/autocomplete-search/?apiKey=41QN8oF7JAPUWkq9b0E7Cryxq3hozhGm3Mmr8j6T&' +
      new URLSearchParams({
        search_value: userSearch,
        search_type: 1
      }).toString()
    );
    const result = await fetch(url)
      .then(response => response.json())
      .then(function (response) {
        if (response.results.length > 0) {
          var item = response.results[0]
          watchModeID = item.id
          watchModeTitleInfoCall()
        }
      })
  }
}

async function watchModeTitleInfoCall() {
  const url = (
    'https://api.watchmode.com/v1/title/' + watchModeID + '/details/?apiKey=41QN8oF7JAPUWkq9b0E7Cryxq3hozhGm3Mmr8j6T&append_to_response=sources'
  );
  const result = await fetch(url)
    .then(response => response.json())
    .then(function (response) {
      updateSearch(response)
    }
    )
}

function updateSearch(watchModeItem) {
  movieTitle.innerHTML = watchModeItem.title
  titleMovie.innerHTML = watchModeItem.title
  movieRating.innerHTML = watchModeItem.user_rating
  movieSummary.innerHTML = watchModeItem.plot_overview
  moviePoster.src = watchModeItem.poster

  networkList.innerHTML = watchModeItem.sources.filter(network => {
    return network.format === "HD"
  })
    .map(network => {
      return `<li class="network-availability"><a href=${network.web_url} target="_blank">${network.name}</a></li>`;
    })
    .join("");

  savedTrailer = watchModeItem.trailer.replace('watch?v=', 'embed/')

  if (watchModeItem.trailer == "") {
    trailerButton.classList.add('hidden')
  } else {
    trailerButton.classList.remove('hidden')
  }
  getMovieQuoteCall()
  hideShowInfo()
  saveToCache(userSearch, watchModeItem)
}


function saveToCache(userSearch, watchModeItem) {
  var cache = localStorage.getItem('cachedMovies')
  if (cache) {
    cache = JSON.parse(cache)
  } else {
    cache = {}
  }
  cache[userSearch.toLowerCase()] = watchModeItem
  console.log(cache)
  localStorage.setItem('cachedMovies', JSON.stringify(cache))
}

function getFromCache(userSearch) {
  var cache = localStorage.getItem('cachedMovies')
  if (cache) {
    cache = JSON.parse(cache)
  } else {
    cache = {}
  }
  console.log(cache)
  return cache[userSearch.toLowerCase()]
}

//MovieQuote API Call
async function getMovieQuoteCall() {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Token token=5HRYr2S7rgwZVzqbxM5uNAtt',
    }
  };
  fetch('https://moviequotes.rocks/api/v1/quotes?movie=' + userSearch, options)
    .then(quoteResponseItem => quoteResponseItem.json())
    .then(function (quoteResponseItem) {
      if (quoteResponseItem.length > 0) {
        movieQuote.innerHTML = quoteResponseItem[0].content
        movieQuotePerson.innerHTML = quoteResponseItem[0].character.name
      }
      else if (quoteResponseItem) {
        movieQuote.innerHTML = 'This is not the quote you are looking for!'
        movieQuotePerson.innerHTML = 'Not Obi-Wan'
      }
    })
    .catch(err => console.error(err));
}

function hideShowInfo() {
  welcomeInfo.classList.add('hidden');
  apiInfo.classList.remove('hidden');
}

// console.log(quote)
//Local Storage search history


function saveSearchHistory() {

console.log('starting savesearchhistory')

  if (localStorage["searchHistory"]) {
    searchHistory = JSON.parse(localStorage['searchHistory']);
    console.log(searchHistory);
  }
  if (searchHistory.indexOf(search_field.value) == -1) {
    searchHistory.unshift(userSearch);
    if (searchHistory.length > 10) {
      searchHistory.pop();
    }
    localStorage['searchHistory'] = JSON.stringify(searchHistory);
  }


  movieList.innerHTML = searchHistory
    .map(userSearch => {
      return `<li class="search-results"><a>${userSearch}</a><li>`;
    })
    .join("");
}