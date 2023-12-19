const Jimp = require("jimp");
const express = require('express');
const fs = require("fs");
const multer = require('multer');
const path = require('path');

const PORT = 3000;

const app = express();
const upload = multer({ dest: 'uploads/' })

app.use(express.json());
app.use(express.urlencoded());

// const url = "./khabib3_smol.png";
// const url = "./fitebig_small.png";
// const url = "./flower.PNG";
// const url = "./khabib2.jpg";
// const url = "./flower2.png";
const breaklineMarker = "BR";
const scaleToFitWidth = 100;
const scaleToFitHeight = 80;
// const chars = "JOLENE";


//TODO: scale to fit (use .scaleToFit())
function getBlackColorCode(intensity) {
  if (intensity < 0 || intensity > 255) {
    throw new Error("Intensity value must be between 0 and 255.");
  }
  const hex = intensity.toString(16).padStart(2, "0");
  const blackColorCode = "#" + hex + hex + hex;
  return blackColorCode;
}

function calculateGreyscaleIntensity(r, g, b) {
  return Math.round(0.2989 * r + 0.587 * g + 0.114 * b);
}

// Loop through each pixel of the image
function getIntensityArray(image) {
  const width = image.getWidth();
  const height = image.getHeight();
  const intensityArray = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelColor = Jimp.intToRGBA(image.getPixelColor(x, y));
      const intensity = calculateGreyscaleIntensity(
        pixelColor.r,
        pixelColor.g,
        pixelColor.b
      );
      intensityArray.push(intensity);
    }
    intensityArray.push("BR");
  }

  return intensityArray;
}

function getFontSize(imageWidth) {
  //   let fontsz = 2;
  let fontsz = "initial";
  if (imageWidth >= 800) {
    fontsz = 1;
  } else if (imageWidth >= 600) {
    fontsz = 1.5;
  } else if (imageWidth >= 400) {
    fontsz = 2;
  } else if (imageWidth >= 200) {
    fontsz = 3;
  }
  return fontsz;
}

function getHTMLPage(html) {
  const template = `
    <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <link rel="stylesheet" href="./styles.css">
        </head>
        <body>
            ${html}
        </body>
        </html>
    `;
  return template;
}

function getOutputHtml(intensityArray, chars, fontsz) {
  let charidxlim = chars.length - 1;
  let charidx = 0;
  let html = "";
  intensityArray.forEach((val) => {
    if (val == breaklineMarker) {
      html += `<br/>`;
    } else {
      let hex = getBlackColorCode(val);
      let char = chars[charidx];
      let elstr = `<b style="font-size: ${fontsz}; color: ${hex}"> ${char} </b>`;
      html += elstr;

      charidx = charidx == charidxlim ? 0 : charidx + 1;
    }
  });
  return html;
}

async function main(url, chars) {
  // Load an image using Jimp
  const image = await Jimp.read(url);
  image.scaleToFit(scaleToFitWidth, scaleToFitHeight);
  const width = image.getWidth();
  const height = image.getHeight();

  // Create an array to store intensity values
  const intensityArray = getIntensityArray(image);
  const fontsz = getFontSize(width);

  // Get image HTML
  const html = getOutputHtml(intensityArray, chars, fontsz);
  const page = getHTMLPage(html);

  return page;
  // await fs.writeFile("output.html", page);
}


app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
})

app.post('/upload', upload.single('imageFile'), async (req, res) => {
  console.log(req.body);
  console.log(req.file);

  const newPath = path.join(req.file.destination, `${req.body.imageName}.png`);
  fs.renameSync(req.file.path, newPath);

  const imageHTML = await main(newPath, req.body.characterificationString);
  res.send(imageHTML);
})


app.get('/', async (req, res) => {
  res.send(imageHTML);
})


app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})
