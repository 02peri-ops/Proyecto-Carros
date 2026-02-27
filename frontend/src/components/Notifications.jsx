function Notifications({ notifications = [] }) {
  if (notifications.length === 0) return null

  return (
    <div className="notifications-container">
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          className={`notification notification-${notification.type}`}
        >
          <span className="notification-message">{notification.message}</span>
          <button className="notification-close">×</button>
        </div>
      ))}
    </div>
  )
}

export default Notifications
