import { Jimp } from "jimp";

async function main() {
  const image = await Jimp.read("public/favicon.png");
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  
  const visited = new Uint8Array(w * h);
  const queue = [{x: 0, y: 0}];
  visited[0] = 1;
  
  while (queue.length > 0) {
    const {x, y} = queue.pop();
    const idx = (w * y + x) << 2;
    const r = image.bitmap.data[idx];
    const g = image.bitmap.data[idx + 1];
    const b = image.bitmap.data[idx + 2];
    
    // Check if pixel is white-ish
    if (r > 240 && g > 240 && b > 240) {
      image.bitmap.data[idx + 3] = 0; // make transparent
      
      // Add neighbors
      const neighbors = [
        {nx: x - 1, ny: y}, {nx: x + 1, ny: y},
        {nx: x, ny: y - 1}, {nx: x, ny: y + 1}
      ];
      
      for (const {nx, ny} of neighbors) {
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nIdx = ny * w + nx;
          if (!visited[nIdx]) {
            visited[nIdx] = 1;
            queue.push({x: nx, y: ny});
          }
        }
      }
    }
  }
  
  await image.write("src-tauri/icons/app-icon.png");
  console.log("Floodfill Done");
}
main().catch(console.error);
