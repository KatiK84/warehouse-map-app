export function Notification({ message, onClose }) {
  if (!message) {
    return null;
  }

  return (
    <div className={`notification notification--${message.type || 'info'}`}>
      <span>{message.text}</span>
      <button type="button" onClick={onClose} className="notification__close">
        Закрыть
      </button>
    </div>
  );
}
