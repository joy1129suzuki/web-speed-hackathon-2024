import { Worker } from 'worker_threads';
import path from 'path';
import type { ConverterInterface } from './ConverterInterface';

export const avifConverter: ConverterInterface = {
  async decode(data: Uint8Array): Promise<ImageData> {
    return runWorker('decode', data);
  },
  async encode(data: ImageData): Promise<Uint8Array> {
    return runWorker('encode', data);
  },
};

function runWorker(type: 'encode' | 'decode', data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve(__dirname, 'imageWorker.js'), {
      workerData: { type, data }
    });

    worker.on('message', (result) => {
      if (result.success) {
        resolve(result.result);
      } else {
        reject(new Error(result.error));
      }
    });

    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}