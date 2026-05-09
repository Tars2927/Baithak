import { useMemo, useState } from "react";

import FileUpload from "./FileUpload";

const EMOJIS = ["😀", "😂", "❤️", "🔥", "👍", "🙏", "🎉", "😎", "🤝", "😊"];

function SmileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18Zm0 16.8a7.8 7.8 0 1 1 0-15.6a7.8 7.8 0 0 1 0 15.6Zm-3.1-8.6a1.2 1.2 0 1 1 0-2.4a1.2 1.2 0 0 1 0 2.4Zm6.2 0a1.2 1.2 0 1 1 0-2.4a1.2 1.2 0 0 1 0 2.4Zm.7 2.2l1.1.7A5.6 5.6 0 0 1 12 16.9a5.6 5.6 0 0 1-4.9-2.8l1.1-.7a4.3 4.3 0 0 0 7.6 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3.4 4.4a1.1 1.1 0 0 1 1.2-.2l16 7a1.1 1.1 0 0 1 0 2l-16 7a1.1 1.1 0 0 1-1.5-1.3l1.7-5.7l8.3-1.2l-8.3-1.2l-1.7-5.7a1.1 1.1 0 0 1 .3-.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function ChatInput({
  disabled,
  isUploading,
  placeholder = "Write a message...",
  onFileSelect,
  onSend,
  onTyping,
}) {
  const [content, setContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const isSubmitDisabled = useMemo(
    () => disabled || isUploading || !content.trim(),
    [content, disabled, isUploading],
  );

  function handleSubmit(event) {
    event.preventDefault();

    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    const didSend = onSend(trimmed);
    if (didSend !== false) {
      setContent("");
      setShowEmojiPicker(false);
    }
  }

  function handleChange(event) {
    setContent(event.target.value);
    onTyping?.(event.target.value);
  }

  function appendEmoji(emoji) {
    const nextValue = `${content}${emoji}`;
    setContent(nextValue);
    onTyping?.(nextValue);
  }

  return (
    <div className="chat-input-stack">
      {showEmojiPicker ? (
        <div className="emoji-picker" role="listbox" aria-label="Emoji picker">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="emoji-button"
              onClick={() => appendEmoji(emoji)}
              disabled={disabled}
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}

      <form className="chat-input-bar" onSubmit={handleSubmit}>
        <FileUpload
          disabled={disabled}
          isUploading={isUploading}
          onSelect={onFileSelect}
        />

        <button
          type="button"
          className="secondary-button emoji-toggle"
          onClick={() => setShowEmojiPicker((current) => !current)}
          disabled={disabled}
          aria-label={showEmojiPicker ? "Close emoji picker" : "Open emoji picker"}
          title={showEmojiPicker ? "Close emoji picker" : "Open emoji picker"}
        >
          <SmileIcon />
          <span>Emoji</span>
        </button>

        <input
          type="text"
          placeholder={placeholder}
          value={content}
          onChange={handleChange}
          disabled={disabled}
        />

        <button type="submit" className="primary-button" disabled={isSubmitDisabled}>
          <SendIcon />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
