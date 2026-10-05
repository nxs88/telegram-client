import axios from 'axios';
import { type SubmitEvent, useState } from 'react';

import { GreenApiClient } from '../../api/greenApi';

import './LoginPage.css';

interface LoginPageProps {
  onLogin: (credentials: {
    idInstance: string;
    apiTokenInstance: string;
  }) => void;
}

const STATE_DESCRIPTIONS: Record<string, string> = {
  notAuthorized:
    'Аккаунт не авторизован. Откройте консоль GREEN-API и подключите аккаунт к инстансу.',
  blocked: 'Инстанс заблокирован. Проверьте его статус в консоли GREEN-API.',
  suspended: 'Инстанс приостановлен.',
  starting: 'Инстанс ещё запускается. Подождите минуту и попробуйте снова.',
  pendingPassword: 'Инстанс ожидает ввода пароля.',
};

function describeRequestError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Не удалось подключиться к GREEN-API';
  }

  const status = error.response?.status;

  switch (status) {
    case 401:
    case 403:
      return 'Неверный idInstance или apiTokenInstance';
    case 400:
    case 404:
      return 'Неверный idInstance или apiUrl (проверьте VITE_GREEN_API_URL в .env)';
    default:
      return `Ошибка запроса: ${status ?? 'нет ответа от сервера'}`;
  }
}

function LoginPage({ onLogin }: LoginPageProps) {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');

  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const id = idInstance.trim();
    const token = apiTokenInstance.trim();

    if (!id || !token) {
      setError('Заполните оба поля');
      return;
    }

    setLoading(true);

    const greenApi = new GreenApiClient({
      apiUrl: import.meta.env.VITE_GREEN_API_URL,
      idInstance: id,
      apiTokenInstance: token,
    });

    try {
      const result = await greenApi.getStateInstance();

      if (result.stateInstance !== 'authorized') {
        setError(
          STATE_DESCRIPTIONS[result.stateInstance] ??
            `Не удалось войти. Состояние инстанса: ${result.stateInstance}`,
        );

        return;
      }

      onLogin({
        idInstance: id,
        apiTokenInstance: token,
      });
    } catch (requestError) {
      console.error('GREEN-API error:', requestError);
      setError(describeRequestError(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__card">
        <div className="login-page__logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
            <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </div>

        <h1 className="login-page__title">GREEN-API Client</h1>
        <p className="login-page__subtitle">
          Введите данные вашего инстанса из консоли GREEN-API
        </p>

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-field__label" htmlFor="idInstance">
              ID Instance
            </label>

            <input
              id="idInstance"
              className="login-field__input"
              type="text"
              value={idInstance}
              onChange={(event) => setIdInstance(event.target.value)}
              placeholder="Например, 7103123456"
              autoComplete="off"
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label className="login-field__label" htmlFor="apiTokenInstance">
              API Token Instance
            </label>

            <div className="login-field__wrapper">
              <input
                id="apiTokenInstance"
                className="login-field__input"
                type={showToken ? 'text' : 'password'}
                value={apiTokenInstance}
                onChange={(event) => setApiTokenInstance(event.target.value)}
                placeholder="Токен инстанса"
                autoComplete="off"
                disabled={loading}
              />

              <button
                type="button"
                className="login-field__toggle"
                onClick={() => setShowToken((previous) => !previous)}
              >
                {showToken ? 'Скрыть' : 'Показать'}
              </button>
            </div>
          </div>

          {error && (
            <p className="login-page__error" role="alert">
              {error}
            </p>
          )}

          <button
            className="login-page__submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Подключение...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
