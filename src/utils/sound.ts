import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';

// 880Hz サイン波 WAV を base64 文字列で生成する
function createBeepBase64(): string {
  const sampleRate = 8000;
  const frequency = 880;
  const durationSec = 0.4;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = new ArrayBuffer(44 + numSamples);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples, true);

  for (let i = 0; i < numSamples; i++) {
    let env = 1.0;
    const fadeIn = sampleRate * 0.01;
    const fadeOut = sampleRate * 0.05;
    if (i < fadeIn) env = i / fadeIn;
    else if (i > numSamples - fadeOut) env = (numSamples - i) / fadeOut;
    const val = 128 + Math.round(100 * env * Math.sin((2 * Math.PI * frequency * i) / sampleRate));
    view.setUint8(44 + i, Math.max(0, Math.min(255, val)));
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

let _audioUri: string | null = null;

async function ensureAudioFile(): Promise<string> {
  if (_audioUri) return _audioUri;
  const base64 = createBeepBase64();
  const path = `${FileSystem.cacheDirectory}beep.wav`;
  await FileSystem.writeAsStringAsync(path, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  _audioUri = path;
  return path;
}

export async function playBeep(): Promise<void> {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});

  try {
    await setAudioModeAsync({ playsInSilentModeIOS: true });
    const uri = await ensureAudioFile();
    const player = createAudioPlayer({ uri });
    player.play();
    setTimeout(() => player.remove(), 2000);
  } catch (_e) {
    // 音声再生失敗時はハプティクスのみ
  }
}
