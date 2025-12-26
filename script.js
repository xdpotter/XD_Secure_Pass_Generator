const passwordField = document.getElementById("password");
const message = document.getElementById("message");
const savedList = document.getElementById("savedList");

function generatePassword() {
  const length = document.getElementById("length").value;
  const upper = document.getElementById("uppercase").checked;
  const lower = document.getElementById("lowercase").checked;
  const number = document.getElementById("numbers").checked;
  const symbol = document.getElementById("symbols").checked;

  let chars = "";
  if (upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (lower) chars += "abcdefghijklmnopqrstuvwxyz";
  if (number) chars += "0123456789";
  if (symbol) chars += "!@#$%^&*()_+";

  if (chars === "") {
    message.textContent = "Select at least one option!";
    return;
  }

  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  passwordField.value = password;
  savePassword(password);
  message.textContent = "Password generated!";
}

function copyPassword() {
  passwordField.select();
  document.execCommand("copy");
  message.textContent = "Copied to clipboard!";
}

function downloadPassword() {
  const text = passwordField.value;
  if (!text) return;

  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "password.txt";
  link.click();
}

function savePassword(pwd) {
  let passwords = JSON.parse(localStorage.getItem("passwords")) || [];
  passwords.push(pwd);
  localStorage.setItem("passwords", JSON.stringify(passwords));
  renderSaved();
}

function renderSaved() {
  savedList.innerHTML = "";
  const passwords = JSON.parse(localStorage.getItem("passwords")) || [];
  passwords.slice(-5).forEach(p => {
    const li = document.createElement("li");
    li.textContent = p;
    savedList.appendChild(li);
  });
}

renderSaved();

function updateStrength(password) {
  if (!password) return;

  let charsetSize = 0;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32;

  const entropy = Math.round(
    Math.log2(Math.pow(charsetSize, password.length))
  );

  document.getElementById("entropyText").textContent =
    `Entropy: ${entropy} bits`;

  const bar = document.getElementById("strengthBar");
  const text = document.getElementById("strengthText");

  let strength = "Weak";
  let width = "25%";

  if (entropy > 80) {
    strength = "Very Strong";
    width = "100%";
    bar.style.background = "#16a34a";
  } else if (entropy > 60) {
    strength = "Strong";
    width = "75%";
    bar.style.background = "#22c55e";
  } else if (entropy > 40) {
    strength = "Medium";
    width = "50%";
    bar.style.background = "#facc15";
  } else {
    bar.style.background = "#ef4444";
  }

  bar.style.width = width;
  text.textContent = strength;

  drawEntropyChart(entropy);
}

function drawEntropyChart(entropy) {
  const canvas = document.getElementById("entropyChart");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#0a2540";
  ctx.fillRect(0, 0, (entropy / 100) * canvas.width, 20);

  ctx.fillStyle = "#999";
  ctx.font = "12px Arial";
  ctx.fillText("0", 0, 45);
  ctx.fillText("100 bits", canvas.width - 60, 45);
}


function generatePassword() {
  const length = parseInt(document.getElementById("length").value);
  const upper = document.getElementById("uppercase").checked;
  const lower = document.getElementById("lowercase").checked;
  const number = document.getElementById("numbers").checked;
  const symbol = document.getElementById("symbols").checked;
  const noSimilar = document.getElementById("noSimilar").checked;
  const noRepeat = document.getElementById("noRepeat").checked;

  let chars = "";
  if (upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (lower) chars += "abcdefghijklmnopqrstuvwxyz";
  if (number) chars += "0123456789";
  if (symbol) chars += "!@#$%^&*()_+";

  if (noSimilar) {
    chars = chars.replace(/[O0l1]/g, "");
  }

  if (!chars) {
    document.getElementById("message").textContent =
      "Please select at least one option.";
    return;
  }

  let password = "";
  while (password.length < length) {
    const char = chars.charAt(Math.floor(Math.random() * chars.length));
    if (noRepeat && password.includes(char)) continue;
    password += char;
  }

  document.getElementById("password").value = password;
  document.getElementById("message").textContent = "Password generated successfully";

  // ✅ IMPORTANT: update strength
  updateStrength(password);
}


