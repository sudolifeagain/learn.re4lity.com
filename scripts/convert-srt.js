// scripts/convert-srt.js

import fs from 'fs/promises';
import path from 'path';

/**
 * SRT形式の字幕データを、ご指定のJSON形式に変換します。
 * @param {string} srtText - SRT形式の字幕テキストデータ
 * @returns {Array<Object>} パースされたJSONオブジェクトの配列 e.g., [{ time, text }]
 */
const parseSrt = (srtText) => {
  const secondsToHHMMSS = (totalSeconds) => {
    const roundedSeconds = Math.round(totalSeconds);
    const hours = Math.floor(roundedSeconds / 3600);
    const minutes = Math.floor((roundedSeconds % 3600) / 60);
    const seconds = roundedSeconds % 60;
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const timeToSeconds = (timeStr) => {
    const parts = timeStr.split(/[,.]/);
    const hms = parts[0];
    const ms = parts[1] || '0';
    const [h, m, s] = hms.split(':').map(Number);
    return h * 3600 + m * 60 + s + Number(ms) / 1000;
  };

  const entries = [];
  const blocks = srtText.trim().replace(/\r/g, '').split('\n\n');

  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 2) continue;
    if (!/^\d+$/.test(lines[0])) continue;

    const timeLine = lines[1];
    const [startStr] = timeLine.split(' --> ');
    const text = lines.slice(2).join(' ').trim();

    if (startStr && text) {
      try {
        const startTimeInSeconds = timeToSeconds(startStr.trim());
        entries.push({
          time: secondsToHHMMSS(startTimeInSeconds),
          text: text,
        });
      } catch (e) {
        // タイムスタンプのパースに失敗した場合はスキップ
      }
    }
  }
  return entries;
};

// --- メイン処理 ---
async function convertSrtToJson() {
  // コマンドライン引数を取得 (node, script.js, input, output の4つ)
  const args = process.argv;
  if (args.length < 4) {
    console.error('エラー: 入力ファイルと出力ファイルのパスを指定してください。');
    console.log('使い方: node scripts/convert-srt.js <入力SRTファイルへのパス> <出力JSONファイルへのパス>');
    return;
  }

  const inputPath = args[2];
  const outputPath = args[3];

  try {
    // 1. SRTファイルを読み込む
    const srtContent = await fs.readFile(inputPath, 'utf-8');

    // 2. JSON形式にパース
    const jsonData = parseSrt(srtContent);

    // 3. 出力先ディレクトリが存在しない場合は作成
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // 4. JSONファイルとして書き出す
    await fs.writeFile(outputPath, JSON.stringify(jsonData, null, 2));

    console.log(`✅ 変換が完了しました: ${outputPath}`);
  } catch (error) {
    console.error(`❌ エラーが発生しました: ${error.message}`);
  }
}

convertSrtToJson();
