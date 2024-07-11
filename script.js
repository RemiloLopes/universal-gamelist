var PORT = 8080;
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');

app.use('/static', express.static(path.join(__dirname, 'public')))
app.set('view engine', 'jade')
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

const axios = require('axios');
const steamApiKey = 'E2DE1D8F01BEB7504583BCDA83E7179A';
const steamID = '76561198059034988'

let steamGamesRaw;
let steamGamesNumber;
let steamGamesData;
const gamePassJSON =  require('./WebScraper/gamepass.json');
const gamePass = [];
let epicGames = [];
let gogGames = [];
let amazonGames = [];
const allGamesArrays = [];
const allGames = [];

// LIDANDO COM SHEETS (Webscraping terceirizado. A ser melhorado.)

const sheetId = "14o_INVq548fZtDBtCkNsI-3y79ywLaisLzG2OdYvPfk";
const sheetNameepicGames = encodeURIComponent("Epic Games");
const sheetNamegogGames = encodeURIComponent("GOG.com");
const sheetNameamazonGames = encodeURIComponent("Amazon Games");
const sheetURLEpic = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetNameepicGames}`;
const sheetURLGOG = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetNamegogGames}`;
const sheetURLAmazon = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetNameamazonGames}`;

// EPIC, GOG, AMAZON 

platforms = ["epicGames", "gogGames", "amazonGames"];

const promises = [];

platforms.forEach(element => {
  if (element === "epicGames") {
    const promise = fetch(sheetURLEpic)
      .then((response) => response.text())
      .then((csvText) => handleResponse(csvText, element));
    promises.push(promise);
  }
  if (element === "gogGames") {
    const promise = fetch(sheetURLGOG)
      .then((response) => response.text())
      .then((csvText) => handleResponse(csvText, element));
    promises.push(promise);
  }
  if (element === "amazonGames") {
    const promise = fetch(sheetURLAmazon)
      .then((response) => response.text())
      .then((csvText) => handleResponse(csvText, element));
    promises.push(promise);
  }
});

Promise.all(promises)
  .then(() => {
    allGamesArrays.push(epicGames[0],gogGames[0],amazonGames[0],gamePass,steamGamesData);
    try{
      for (let i = 0; i < allGamesArrays.length; i++) {
        for (let j = 0; j < allGamesArrays[i].length; j++) {
          allGames.push(allGamesArrays[i][j]);
        }
      }
    } catch (error) {
      console.error('Error accessing allGames',error);
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });

function handleResponse(csvText, platform) {
  let sheetObjects = csvToObjects(csvText);
  if (platform === "epicGames") {
    epicGames.push(sheetObjects);
  } else if (platform === "gogGames") {
    gogGames.push(sheetObjects);
  } else if (platform === "amazonGames") {
    amazonGames.push(sheetObjects);
  }
}


function csvToObjects(csv) {
  if (csv) {
    const csvRows = csv.split("\n");
    const propertyNames = csvSplit(csvRows[0]);
    let objects = [];
    for (let i = 1, max = csvRows.length; i < max; i++) {
      let thisObject = {};
      let row = csvSplit(csvRows[i]);
      for (let j = 0, max = row.length; j < max; j++) {
        if (row[j] !== '') {
          thisObject[propertyNames[j]] = row[j];
        }
      }
      if (Object.keys(thisObject).length > 0) {
        objects.push(thisObject);
      }
    }
    return objects;
  } else {
    return [];
  }
}

function csvSplit(row) {
  const regex = /(?:"([^"]*(?:""[^"]*)*)"|([^,]+))/g;
  const matches = row.match(regex);
  return matches.map(match => {
    if (match.startsWith('"') && match.endsWith('"')) {
      return match.slice(1, -1).replace(/""/g, '"');
    } else {
      return match;
    }
  });
}

// GAME PASS

for (let i = 0; i < gamePassJSON.length; i++) {
  gamePass.push({
    name: gamePassJSON[i],
    plataforma: "Game Pass"
  });
}

// SEARCHBAR

app.post('/searchbar', (req, res) => {
  const searchQuery = req.body.gameName;
  const searchResults = getSearchResults(searchQuery);
  res.json(searchResults);
});

function getSearchResults(searchQuery) {
  let gamesArray = [];
  allGames.forEach(game => {
    if (game.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      gamesArray.push(game);
    }
  });
  return gamesArray;
}

// API da Steam
axios.get('http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/', {
  params: {
    key: steamApiKey,
    steamid: steamID,
    format: 'json',
    include_appinfo: '1'
  }
})
.then(response =>{
  answer = response.data;
  steamGamesRaw = response.data.response.games;
  steamGamesNumber = response.data.response.game_count;
  steamGamesData = [];
  for (let i = 0; i < steamGamesNumber; i++) {
    steamGamesData[i] = {name: steamGamesRaw[i].name, logo: `http://media.steampowered.com/steamcommunity/public/images/apps/${steamGamesRaw[i].appid}/${steamGamesRaw[i].img_icon_url}.jpg`,plataforma:"Steam"};
  }

})
.catch(error => {
  console.error('Erro na chamada da API da Steam:', error);
});

// ENVIANDO DADOS PARA A PÁGINA

app.get('/', function (req, res) {
  if (allGames && allGames.length > 0) {
    res.render('index', { title: 'Meus jogos', allGames: allGames });
  } else {
    res.render('index', { title: 'Meus jogos', allGames: [] });
  }
});
