import { useRef } from "react";

function PaperclipIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8.4 17.6c-1.9-1.9-1.9-5 0-6.9l5.4-5.4a4.2 4.2 0 0 1 5.9 5.9l-6.4 6.4a6 6 0 0 1-8.5-8.5l6.4-6.4l1.4 1.4l-6.4 6.4a4 4 0 0 0 5.7 5.7l6.4-6.4a2.2 2.2 0 1 0-3.1-3.1l-5.4 5.4a2 2 0 1 0 2.8 2.8l4.4-4.4l1.4 1.4l-4.4 4.4a4 4 0 0 1-5.6 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function FileUpload({ disabled, isUploading, onSelect }) {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current?.click();
  }

  function handleChange(event) {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    onSelect(selectedFile);
    event.target.value = "";
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="visually-hidden"
        onChange={handleChange}
        disabled={disabled || isUploading}
      />

      <button
        type="button"
        className="secondary-button upload-button"
        onClick={handleClick}
        disabled={disabled || isUploading}
        aria-label={isUploading ? "Uploading attachment" : "Attach file"}
        title={isUploading ? "Uploading attachment" : "Attach file"}
      >
        <PaperclipIcon />
        <span>{isUploading ? "Uploading..." : "Attach"}</span>
      </button>
    </>
  );
}
