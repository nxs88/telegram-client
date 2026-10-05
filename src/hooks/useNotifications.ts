import axios from 'axios';
import { useEffect } from 'react';

import { useGreenApi } from '../context/GreenApiContext';
import type { Notification } from '../types/greenApi';

const RETRY_DELAY_MS = 10_000;
const RATE_LIMIT_DELAY_MS = 30_000;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const isRateLimited = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 429;

export function useNotifications(
  onNotification: (notification: Notification) => void,
): void {
  const { client } = useGreenApi();

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function poll() {
      while (!cancelled) {
        try {
          const notification = await client.receiveNotification(
            controller.signal,
          );

          if (cancelled) break;

          if (notification) {
            try {
              onNotification(notification);
            } catch (error) {
              console.error('Ошибка обработки уведомления:', error);
            }

            await client.deleteNotification(notification.receiptId);
          }
          if (!notification) {
            continue;
          }
        } catch (error) {
          if (cancelled) break;

          if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') {
            break;
          }

          const delay = isRateLimited(error)
            ? RATE_LIMIT_DELAY_MS
            : RETRY_DELAY_MS;

          console.error('receiveNotification error:', error);

          await sleep(delay);
        }
      }
    }

    poll();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [client, onNotification]);
}
