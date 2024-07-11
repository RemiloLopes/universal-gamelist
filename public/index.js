const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

const plataforma = document.getElementsByClassName("platform")
for (let index = 0; index < plataforma.length; index++) {
  const element = plataforma[index];
  if (element.textContent == 'Steam') {
    element.classList.add('steam');
  }
  if (element.textContent == 'Epic Games') {
    element.classList.add('epic');
  }
  if (element.textContent == 'GOG') {
    element.classList.add('gog');
  }
  if (element.textContent == 'Amazon Games') {
    element.classList.add('amazon');
  }
  if (element.textContent == 'Game Pass') {
    element.classList.add('gamepass');
  }
}

let topButton = document.getElementById("topButton");
window.onscroll = function() {scrollFunction()};
function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    topButton.style.display = "block";
  } else {
    topButton.style.display = "none";
  }
}

function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

searchInput.addEventListener('keyup', () => {
  const searchQuery = searchInput.value;
  console.log(searchInput.value);

  fetch('/searchbar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ gameName: searchQuery })
  })
  .then(response => response.json())
  .then(data => {
    // Update the search results div with the response from the server
    searchResults.innerHTML = '';
    let table = document.createElement('table');
    let breakLine = document.createElement('tr');
    // let h1 = document.createElement('th');
    let h2 = document.createElement('th');
    let h3 = document.createElement('th');
    // h1.textContent = 'Logo';
    h2.textContent = 'Nome';
    h3.textContent = 'Plataforma';
    h2.classList.add('namecell');
    h3.classList.add('platform');
    searchResults.appendChild(table);
    table.appendChild(breakLine);
    // breakLine.appendChild(h1);
    breakLine.appendChild(h2);
    breakLine.appendChild(h3);
    data.forEach(game => {
      let breakLine = document.createElement('tr');
      table.appendChild(breakLine);
      // let gameLogoContainer = document.createElement('td');
      // let gameLogo = document.createElement('img');
      // gameLogo.src = game.logo;
      // gameLogo.alt = game.name;
      // gameLogo.classList.add('logo');
      let gameName = document.createElement('td');
      gameName.textContent = game.name;
      gameName.classList.add('namecell');
      let gamePlatform = document.createElement('td');
      gamePlatform.textContent = game.plataforma;
      gamePlatform.classList.add('platform');
      if (game.plataforma == 'Steam') {
        gamePlatform.classList.add('steam');
      }
      if (game.plataforma == 'Epic Games') {
        gamePlatform.classList.add('epic');
      }
      if (game.plataforma == 'GOG') {
        gamePlatform.classList.add('gog');
      }
      if (game.plataforma == 'Amazon Games') {
        gamePlatform.classList.add('amazon');
      }
      if (game.plataforma == 'Game Pass') {
        gamePlatform.classList.add('gamepass');
      }
      // breakLine.appendChild(gameLogoContainer);
      // gameLogoContainer.appendChild(gameLogo);
      breakLine.appendChild(gameName);
      breakLine.appendChild(gamePlatform);
    });
  })
  .catch(error => {
    console.error('Error:', error);
  });
});