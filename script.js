function generatePassword() {
    const length = document.getElementById("length").value;
    const sets = {
        upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        lower: "abcdefghijklmnopqrstuvwxyz",
        nums: "0123456789",
        syms: "!@#$%^&*()_+"
    };

    let charPool = "";
    if (document.getElementById("uppercase").checked) charPool += sets.upper;
    if (document.getElementById("lowercase").checked) charPool += sets.lower;
    if (document.getElementById("numbers").checked) charPool += sets.nums;
    if (document.getElementById("symbols").checked) charPool += sets.syms;
    
    if (document.getElementById("noSimilar").checked) {
        charPool = charPool.replace(/[O0l1]/g, "");
    }

    if (!charPool) {
        showMsg("Select at least one option!", "red");
        return;
    }

    let password = "";
    for (let i = 0; i < length; i++) {
        password += charPool.charAt(Math.floor(Math.random() * charPool.length));
    }

    document.getElementById("password").value = password;
    updateStrength(password, charPool.length);
    showMsg("Secure password generated!", "green");
}

function updateStrength(pwd, poolSize) {
    const entropy = Math.round(pwd.length * Math.log2(poolSize));
    const bar = document.getElementById("strengthBar");
    const text = document.getElementById("strengthText");
    
    let color = "#ef4444";
    let strength = "Weak";
    let width = "25%";

    if (entropy > 80) {
        color = "#16a34a"; strength = "Excellent"; width = "100%";
    } else if (entropy > 60) {
        color = "#22c55e"; strength = "Strong"; width = "75%";
    } else if (entropy > 40) {
        color = "#eab308"; strength = "Medium"; width = "50%";
    }

    bar.style.width = width;
    bar.style.background = color;
    text.innerText = strength + " (" + entropy + " Bits)";
    text.style.color = color;
}

function copyPassword() {
    const pwd = document.getElementById("password");
    if (!pwd.value) return;
    pwd.select();
    document.execCommand("copy");
    showMsg("Copied to clipboard!", "green");
}

function showMsg(txt, color) {
    const m = document.getElementById("message");
    m.innerText = txt;
    m.style.color = color;
    setTimeout(() => m.innerText = "", 3000);
}

// Dark Mode Toggle
const btn = document.getElementById("darkToggle");
btn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

// Load Theme
if(localStorage.getItem("theme") === "dark") document.body.classList.add("dark");

function calculateEntropy(pwd, poolSize) {
    const entropy = Math.round(pwd.length * Math.log2(poolSize));
    const text = document.getElementById("strengthText");
    
    // Add a descriptive tooltip or text
    let description = "";
    if (entropy < 40) description = " (Easy to crack)";
    else if (entropy < 60) description = " (Decent for non-sensitive sites)";
    else if (entropy < 80) description = " (Strong security)";
    else description = " (Military grade entropy)";

    text.innerText = `${label} - ${entropy} bits ${description}`;
}

//Normal Export

// function downloadPassword() {
//   const passwordField = document.getElementById("password");
//   const password = passwordField.value;

//   if (!password) {
//     alert("Please generate a password first.");
//     return;
//   }

//   const blob = new Blob([password], { type: "text/plain" });
//   const url = URL.createObjectURL(blob);

//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "xd-secure-password.txt";
//   document.body.appendChild(a);
//   a.click();

//   document.body.removeChild(a);
//   URL.revokeObjectURL(url);
// }

//Designed export

function downloadPassword() {
  const password = document.getElementById("password").value;
  const length = document.getElementById("length").value;

  if (!password) {
    alert("Please generate a password first.");
    return;
  }

  const options = [];
  if (document.getElementById("uppercase").checked) options.push("Uppercase");
  if (document.getElementById("lowercase").checked) options.push("Lowercase");
  if (document.getElementById("numbers").checked) options.push("Numbers");
  if (document.getElementById("symbols").checked) options.push("Symbols");

  const now = new Date();
  const timestamp = now.toISOString().replace("T", " ").split(".")[0];

  const content = `
========================================
🔐 XD SECURE PASS — PASSWORD EXPORT
========================================

Generated Password:
-------------------
${password}

Password Length: ${length}
Character Set  : ${options.join(", ")}
Entropy Level  : Strong

Security Tips:
--------------
• Never share this password with anyone
• Do not reuse passwords across websites
• Enable 2FA wherever possible
• Store passwords in a trusted password manager

Generated On:
-------------
${timestamp}

Generated Locally in Your Browser
No data was stored or transmitted.

========================================
© XD Secure Pass Generator | XDPOTTER
========================================
`;

  const blob = new Blob([content.trim()], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `xd-secure-password-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
