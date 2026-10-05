import { type SubmitEvent, useState } from 'react';

interface MessageInputProps {
  onSend: (text: string) => Promise<void>;
}

function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);

    try {
      await onSend(trimmed);
      setText('');
    } catch {
      // ошибка уже показана в ChatWindow
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <textarea
        value={text}
        rows={1}
        placeholder="Сообщение..."
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
      />

      <button
        type="submit"
        className="button"
        disabled={sending || !text.trim()}
      >
        {sending ? '...' : 'Отправить'}
      </button>
    </form>
  );
}

export default MessageInput;
