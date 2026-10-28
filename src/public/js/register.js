const form = document.querySelector("#form");
const formError = document.querySelector("#form-error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.textContent = "";

  const username = document.querySelector("#username").value.trim();
  const password = document.querySelector("#password").value;

  try {
    const response = await fetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      formError.textContent = data.errors ? data.errors.join(" ") : "No se pudo completar el registro.";
      return;
    }

    window.location.href = "/";
  } catch (error) {
    formError.textContent = "No se pudo conectar con el servidor.";
  }
});
