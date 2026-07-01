'use client';

/**
 * @fileOverview Utility for interacting with the Yandex Games SDK.
 */

export interface YandexSDK {
  auth: {
    getPlayerData: () => Promise<any>;
  };
  getLeaderboards: () => Promise<any>;
  adv: {
    showFullscreenAdv: (callbacks?: {
      onOpen?: () => void;
      onClose?: (wasShown: boolean) => void;
      onError?: (error: any) => void;
      onOffline?: () => void;
    }) => void;
  };
  getStorage: () => Promise<any>;
  features: {
    LoadingAPI?: {
      ready: () => void;
    };
  };
}

let yandexInstance: YandexSDK | null = null;

/**
 * Initializes the Yandex Games SDK.
 */
export async function initYandexSDK(): Promise<YandexSDK | null> {
  if (typeof window === 'undefined') return null;
  if (yandexInstance) return yandexInstance;

  return new Promise((resolve) => {
    // @ts-ignore
    if (typeof window.YaGames !== 'undefined') {
      // @ts-ignore
      window.YaGames.init().then((sdk: YandexSDK) => {
        yandexInstance = sdk;
        console.log('Yandex SDK initialized successfully');
        resolve(sdk);
      }).catch((e: any) => {
        console.error('Yandex SDK failed to initialize:', e);
        resolve(null);
      });
    } else {
      resolve(null);
    }
  });
}

/**
 * Returns the current Yandex SDK instance if initialized.
 */
export function getYandexSDK(): YandexSDK | null {
  return yandexInstance;
}

/**
 * Syncs the high score to Yandex Cloud Storage.
 */
export async function syncHighScoreToYandex(score: number) {
  const sdk = getYandexSDK();
  if (!sdk) return;

  try {
    const storage = await sdk.getStorage();
    const data = await storage.get(['highScore']);
    const currentHigh = data.highScore || 0;

    if (score > currentHigh) {
      await storage.set({ highScore: score });
      console.log('High score synced to Yandex Cloud');
    }
  } catch (e) {
    console.warn('Failed to sync high score to Yandex:', e);
  }
}

/**
 * Fetches the high score from Yandex Cloud Storage.
 */
export async function fetchHighScoreFromYandex(): Promise<number | null> {
  const sdk = getYandexSDK();
  if (!sdk) return null;

  try {
    const storage = await sdk.getStorage();
    const data = await storage.get(['highScore']);
    return data.highScore || 0;
  } catch (e) {
    console.warn('Failed to fetch high score from Yandex:', e);
    return null;
  }
}
