const today = new Date().toDateString();
const lastOpened = localStorage.getItem("lastOpened");

// ---------------- HABITS ----------------
const blocks = [
  { start: "05:00", label: "Wake up", type: "fixed" },
  { start: "05:30", label: "Wash / Move", type: "fixed" },
  { start: "06:00", label: "Exercise", type: "fixed" },
  { start: "06:30", label: "Bath", type: "fixed" },
  { start: "07:00", label: "Pooja", type: "fixed" },
  { start: "07:15", label: "Meditation", type: "fixed" },
  { start: "07:40", label: "Breakfast", type: "fixed" },
  { start: "08:00", label: "Task 1", type: "dynamic" },
  { start: "10:15", label: "Breather", type: "dynamic" },
  { start: "10:15", label: "Task 2", type: "dynamic" },
  { start: "13:00", label: "Lunch", type: "fixed" },
  { start: "13:45", label: "Task 3", type: "dynamic" },
  { start: "17:00", label: "Breather", type: "dynamic" },
  { start: "17:15", label: "Task 4", type: "dynamic" },
  { start: "20:00", label: "Reading", type: "dynamic" },
  { start: "21:00", label: "Dinner", type: "fixed" },
  { start: "21:45", label: "Sleep", type: "fixed" }
];

blocks.sort((a, b) => a.start.localeCompare(b.start));

// ---------------- STORAGE ----------------
const dayData = JSON.parse(localStorage.getItem("day")) || [];
const execNotes = JSON.parse(localStorage.getItem("execNotes")) || {};
const tracking = JSON.parse(localStorage.getItem("tracking")) || {};

const schedule = document.getElementById("schedule");

// ---------------- MODAL ----------------
let modalMode = null;
let currentIndex = null;

const modal = document.getElementById("trackerModal");
const modalTitle = document.getElementById("modalTitle");
const reflectionText = document.getElementById("reflectionText");
const reflectionScore = document.getElementById("reflectionScore");
const scoreWarning = document.getElementById("scoreWarning");

// ---------------- RENDER ----------------
schedule.innerHTML = "";

blocks.forEach((block, i) => {
  const isNewDay = lastOpened !== today;
  const saved = dayData[i] || {};

  const locked = block.type === "fixed"
    ? true
    : isNewDay ? false : saved.locked || false;

  const done = isNewDay ? false : saved.done || false;

  const div = document.createElement("div");
  div.className = "block";
  div.dataset.locked = locked;

  div.innerHTML = `
    <div class="row">
      <strong>${block.start}</strong>

      <input type="text"
        value="${saved.text || block.label}"
        ${locked ? "disabled" : ""}
      />

      ${block.type === "dynamic" ? `<span class="icon note">📝</span>` : ""}

      <span class="icon track">📊</span>
      <span class="icon lock">${locked ? "🔒" : "🔓"}</span>

      <input type="checkbox" class="done" ${done ? "checked" : ""} />
    </div>
  `;

  schedule.appendChild(div);

  const text = div.querySelector("input[type=text]");
  const checkbox = div.querySelector(".done");
  const lockIcon = div.querySelector(".lock");
  const noteIcon = div.querySelector(".note");
  const trackIcon = div.querySelector(".track");

  if (done) text.classList.add("done-text");

  checkbox.addEventListener("change", () => {
    text.classList.toggle("done-text", checkbox.checked);
  });

  lockIcon.addEventListener("click", () => {
    if (div.dataset.locked === "true") return;
    div.dataset.locked = "true";
    text.disabled = true;
    lockIcon.textContent = "🔒";
  });

  if (noteIcon) {
    noteIcon.addEventListener("click", () => {
      modalMode = "exec";
      currentIndex = i;

      modalTitle.textContent = "Description of the task";
      reflectionText.placeholder = "Describe what you want to do in this slot...";
      reflectionText.value = execNotes[i] || "";
      reflectionScore.style.display = "none";
      scoreWarning.style.display = "none";

      modal.classList.remove("hidden");
    });
  }

  trackIcon.addEventListener("click", () => {
    modalMode = "reflect";
    currentIndex = i;

    modalTitle.textContent = "Daily Reflection";
    reflectionText.placeholder = "How did this habit go today?";
    reflectionText.value = tracking[today]?.[i]?.note || "";
    reflectionScore.value = tracking[today]?.[i]?.score || "";
    reflectionScore.style.display = "block";
    scoreWarning.style.display = "none";

    modal.classList.remove("hidden");
  });
});

// ---------------- MODAL SAVE ----------------
document.getElementById("trackSave").onclick = () => {
  if (modalMode === "exec") {
    execNotes[currentIndex] = reflectionText.value;
    localStorage.setItem("execNotes", JSON.stringify(execNotes));
    modal.classList.add("hidden");
    return;
  }

  if (modalMode === "reflect") {
    const score = Number(reflectionScore.value);

    if (isNaN(score) || score < 1 || score > 10) {
      scoreWarning.style.display = "block";
      return; // BLOCK SAVE
    }

    scoreWarning.style.display = "none";

    tracking[today] = tracking[today] || {};
    tracking[today][currentIndex] = {
      note: reflectionText.value,
      score: score
    };

    localStorage.setItem("tracking", JSON.stringify(tracking));
    modal.classList.add("hidden");
  }
};

document.getElementById("trackCancel").onclick = () => {
  modal.classList.add("hidden");
  scoreWarning.style.display = "none";
};

// ---------------- SAVE DAY ----------------
document.getElementById("save").onclick = () => {
  const data = [];

  document.querySelectorAll(".block").forEach(b => {
    data.push({
      text: b.querySelector("input[type=text]").value,
      done: b.querySelector(".done").checked,
      locked: b.dataset.locked === "true"
    });
  });

  localStorage.setItem("day", JSON.stringify(data));
  localStorage.setItem("lastOpened", today);
};

localStorage.setItem("lastOpened", today);





