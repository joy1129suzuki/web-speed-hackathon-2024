const { parentPort } = require('worker_threads');
const sharp = require('sharp');

// ワーカースレッドで実行される処理
parentPort.on('message', async (task) => {
  try {
    // ここで画像のエンコードやデコードの処理を行う
    const result = await sharp(task.data).avif().toBuffer();
    parentPort.postMessage({ success: true, result });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
});
