import { Jimp } from "jimp";

async function main() {
  const image = await Jimp.read("src-tauri/icons/app-icon.png");
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    
    // If pixel is near white
    if (r > 240 && g > 240 && b > 240) {
      this.bitmap.data[idx + 3] = 0; // set alpha to 0
    }
  });
  await image.write("src-tauri/icons/app-icon-transparent.png");
  console.log("Done");
}
main().catch(console.error);
