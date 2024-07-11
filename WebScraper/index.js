import puppeteer from "puppeteer";
import fs from "fs";

export async function startWebScrapping (platform) {
  // Start a Puppeteer session with:
  // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
  // - no default viewport (`defaultViewport: null` - website page will in full width and height)
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  if (platform.toString().toLowerCase() === 'gamepass'){
    await page.goto("https://www.xbox.com/pt-BR/xbox-game-pass/games", {
      waitUntil: "domcontentloaded",
    });
    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    const pcButton = page.locator(".platpc");
    await pcButton.click();
    await sleep(10000).then(() => {
      console.log("Games loaded!");
      pcButton.click();
    });
    await sleep(10000).then(() => {
      console.log("PC games selected!");
      pcButton.click();
      console.log("Scrolling... Please wait for around 30 seconds.");
    });
      let i = 0;
      async function myLoop() {
          setTimeout(function() {
              let nextPage = page.locator('.showMoreText');
              nextPage.click();
              i++;
              if (i < 15) {
                  myLoop();
              } else {
                console.log("Scrolling done!");
                page.$$eval('.x1GameName', (titles) => {
                  return titles.map((title) => {
                    return title.textContent;
                  });
                }).then((titles) => {
                  console.log(titles);
                  const jsonData = JSON.stringify(titles);
                  fs.writeFile('gamepass.json', jsonData, (err) => {
                    if (err) {
                      console.error('Error writing file:', err);
                    } else {
                      console.log('JSON data saved to gamepass.json');
                    }
                  });
                }).then(() => {
                  browser.close();
                });;
              }
          },2000)
      }
    await myLoop();
  } else if (platform.toString().toLowerCase() === "amazon"){
    console.log("Amazon");
  } else if (platform.toString().toLowerCase() === "epic"){
    console.log("Epic");
  } else if (platform.toString().toLowerCase() === "ea"){
    console.log("EA");
  } else if (platform.toString().toLowerCase() === "gog"){
    console.log("GOG");
  }
};

function a (n){
  if (n.toString().toLowerCase() === "loka"){
    console.log(n);
  } else {
    console.log("Not Loka");
  }
}

// Start the scraping
startWebScrapping('EPIC');
// a('loka');