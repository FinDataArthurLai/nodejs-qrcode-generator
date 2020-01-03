const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");
const MQRCode = require("magic-qr-code");
const Canvas = require("canvas");

function draw(data, size = 1024, ftype = `svg`) {
  let marginSize = 1;
  let dataLength = data.length;
  let dataLengthWithMargin = dataLength + 2 * marginSize;
  let canvas = Canvas.createCanvas(size, size, ftype); // 產出畫布
  let ctx = canvas.getContext("2d"); // 產出畫筆
  let pointSize = Math.floor(size / dataLengthWithMargin);
  if (pointSize === 0) {
    throw new Error("cannot draw this QR Code");
  }
  let margin = Math.floor((size - pointSize * dataLength) / 2);
  ctx.fillStyle = "white"; 
  ctx.fillRect(0, 0, size, size);
  // 繪製 qrcode
  ctx.fillStyle = "rgba(93,188,210,1)";
  for (let i = 0; i < dataLength; ++i) {
    for (let j = 0; j < dataLength; ++j) {
      if (data[i][j]) {
        let x = j * pointSize + margin;
        let y = i * pointSize + margin;
        ctx.fillRect(x, y, pointSize, pointSize);
      }
    }
  }
  return canvas;
}

let aryRows = [];
fs.createReadStream(path.resolve(__dirname, "qrcode.csv")) // 讀 csv 檔
  .pipe(csv.parse({ headers: true }))
  .on("error", error => console.error(error))
  .on("data", row => {
    aryRows.push(row); // 將檔案結構存到 array 裡
  })
  .on("end", rowCount => {
    console.log(`Parsed ${rowCount} rows`);
    aryRows.forEach(function(row) { // 解析檔案結構做相對應 QRCode 產出
      console.log(row);

      if (row.c_count != 0) {
        let result = MQRCode.encode(row.prod_uri.toUpperCase()); // qrcode encoding
        let ftype = `svg`;
        let canvas = draw(result, parseInt(row.c_size), ftype); // drawing
        let pngBuffer = canvas.toBuffer();
        fs.writeFileSync(`./images/55/${row.file_name}.${ftype}`, pngBuffer); // saving
      }

      if (row.b_count != 0) {
        let result = MQRCode.encode(row.prod_uri.toUpperCase());
        let ftype = `svg`;
        let canvas = draw(result, parseInt(row.b_size), ftype);
        let pngBuffer = canvas.toBuffer();
        fs.writeFileSync(`./images/44/${row.file_name}.${ftype}`, pngBuffer);
      }
    });
  });
