const socket = io();

const send = document.querySelector("#send-message");
const messageInput = document.querySelector("#message");
const allMessages = document.querySelector("#all-messages");
const logoutButton = document.querySelector("#logout");
const usernameLabel = document.querySelector("#current-username");

// Las fechas llegan del servidor en ISO 8601 (UTC) y se muestran en la hora local del navegador.
function formatTime(isoDate) {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Color estable por usuario para que cada avatar sea distinguible.
function avatarColor(username) {
  let hash = 0;
  for (const char of username) hash = (hash * 31 + char.codePointAt(0)) >>> 0;
  return `hsl(${hash % 360}, 55%, 40%)`;
}

function createAvatar(username) {
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = username.charAt(0).toUpperCase();
  avatar.style.backgroundColor = avatarColor(username);
  avatar.setAttribute("aria-hidden", "true");
  return avatar;
}

// Previene XSS: construye el mensaje con nodos de texto en vez de interpolar
// HTML crudo en el DOM, que es lo que permitia inyectar scripts arbitrarios.
function renderMessage({ user, message, date }) {
  const container = document.createElement("div");
  container.className = "message";

  const imageContainer = document.createElement("div");
  imageContainer.className = "image-container";
  imageContainer.appendChild(createAvatar(user));

  const body = document.createElement("div");
  body.className = "message-body";

  const userInfo = document.createElement("div");
  userInfo.className = "user-info";

  const usernameSpan = document.createElement("span");
  usernameSpan.className = "username";
  usernameSpan.textContent = user;

  const timeSpan = document.createElement("time");
  timeSpan.className = "time";
  timeSpan.textContent = formatTime(date);
  timeSpan.dateTime = date;

  const text = document.createElement("p");
  text.textContent = message;

  userInfo.append(usernameSpan, timeSpan, text);
  body.appendChild(userInfo);
  container.append(imageContainer, body);
  allMessages.appendChild(container);
  allMessages.scrollTop = allMessages.scrollHeight;
}

function renderSystemNotice(text) {
  const notice = document.createElement("div");
  notice.className = "system-notice";
  notice.textContent = text;
  allMessages.appendChild(notice);
  allMessages.scrollTop = allMessages.scrollHeight;
}

function sendCurrentMessage() {
  const value = messageInput.value.trim();
  if (value === "") return;
  socket.emit("message", value);
  messageInput.value = "";
}

send.addEventListener("click", sendCurrentMessage);

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendCurrentMessage();
  }
});

socket.on("history", (messages) => {
  messages.forEach((entry) =>
    renderMessage({
      user: entry.username,
      message: entry.content,
      date: entry.created_at,
    })
  );
});

socket.on("message", renderMessage);

socket.on("userStatus", ({ username, status, date }) => {
  const action = status === "connected" ? "se ha conectado" : "se ha desconectado";
  renderSystemNotice(`${username} ${action} (${formatTime(date)})`);
});

socket.on("errorMessage", (text) => {
  renderSystemNotice(text);
});

socket.on("connect_error", () => {
  window.location.href = "/login";
});

logoutButton.addEventListener("click", async () => {
  await fetch("/auth/logout", { method: "POST" });
  window.location.href = "/login";
});

fetch("/api/session")
  .then((res) => res.json())
  .then(({ authenticated, username }) => {
    if (authenticated) {
      usernameLabel.textContent = username;
    }
  });
