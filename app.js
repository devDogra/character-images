const Jimp = require("jimp");
const fs = require('fs/promises');

const url = "./lena-small-bw.jpg";


function getBlackColorCode(intensity) {
    if (intensity < 0 || intensity > 255) {
      throw new Error("Intensity value must be between 0 and 255.");
    }
    const hex = intensity.toString(16).padStart(2, "0");
    const blackColorCode = "#" + hex + hex + hex;
    return blackColorCode;
  }

async function main() {
  // Load an image using Jimp
  const image = await Jimp.read(url);
  const width = image.getWidth();
  const height = image.getHeight();

  // Create an array to store intensity values
  const intensityArray = [];

  // Loop through each pixel of the image
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Get the pixel color at the current coordinates
      const pixelColor = Jimp.intToRGBA(image.getPixelColor(x, y));

      // Calculate grayscale intensity using the formula: intensity = 0.2989 * red + 0.5870 * green + 0.1140 * blue
      const intensity = Math.round(
        0.2989 * pixelColor.r + 0.587 * pixelColor.g + 0.114 * pixelColor.b
      );

      // Add the intensity value to the array
      intensityArray.push(intensity);
    }
    intensityArray.push("BR");
    
  }

  // Log the intensity array
  console.log(intensityArray);

  let html = "";
  let rowpixelidx = 0;
  intensityArray.forEach(val => {
    if (val == "BR") {
        html += `<br/>`;

    } else {
        let hex = getBlackColorCode(val); 
        let char = 'J';
        let elstr = `<b style="color: ${hex}"> ${char} </b>`;
        html += elstr; 
    }

  })

  await fs.writeFile('output.html', html); 
}

main().then().catch();
