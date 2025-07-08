import { auth } from "./firebaseConfig.js";
import { addTask, getTasks, updateTask } from "./database.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

let currentUser = null;


document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userName = user.displayName;
      currentUser = user;
      const tasks = await getTasks(user);
      const userField = document.getElementById("userName");

      userField.innerText = `Welcome ${userName}`
      tasks.forEach(renderTask);
      setupTaskPage();
    } else {
      window.location.href = "index.html";
    }
  });

  const logoutButton = document.getElementById("logout");

  logoutButton.addEventListener("click", logout);
});

async function logout() {
  await signOut(auth);
  currentUser = null;
  window.location.href = "./index.html";
  console.log(currentUser);

  
}

function setupTaskPage() {
  const addButton = document.querySelector("#todo #showForm");
  const fillForm = document.querySelector("#taskForm");
  const formButton = document.querySelector("#addTask");
  const taskText = document.querySelector("#inputBar");

  addButton.addEventListener("click", () => {
    fillForm.style.display = "flex";
  });

  formButton.addEventListener("click", async () => {
    const taskName = taskText.value.trim();
    if (!taskName) return;

    const tempId = "temp-" + Date.now();
    const tempTask = {
      id: tempId,
      name: taskName,
      column: "todo",
      description: "",
    };

    renderTask(tempTask);
    taskText.value = "";
    fillForm.style.display = "none";

    try {
      const realTask = await addTask(currentUser, taskName, "todo", "");
      const tempCard = document.querySelector(`[data-id="${tempId}"]`);
      if (tempCard) {
        tempCard.dataset.id = realTask.id;
      }
    } catch (error) {
      console.error("Task creation failed:", error);
      const tempCard = document.querySelector(`[data-id="${tempId}"]`);
      if (tempCard) tempCard.remove();
      alert("Failed to save task to Firebase.");
    }
  });

  document.querySelectorAll(".card").forEach(attachDragHandlers);
}

function renderTask(task) {
  const taskElement = document.createElement("div");
  taskElement.classList.add("card");
  taskElement.innerText = task.name;
  taskElement.dataset.id = task.id;
  taskElement.dataset.description = task.description;
  attachDragHandlers(taskElement);

  const column = document.querySelector(`#${task.column}`);
  const formContainer = column.querySelector("#formContainer");

  if (formContainer) {
    column.insertBefore(taskElement, formContainer);
  } 
  else {
    column.appendChild(taskElement);
  }
}

function attachDragHandlers(card) {
  let isDragging = false;
  let hasMoved = false;
  let offsetX = 0,
    offsetY = 0;
  let startX = 0,
    startY = 0;
  let pointerDown = false;

  card.addEventListener("pointerdown", (e) => {
    pointerDown = true;
    startX = e.clientX;
    startY = e.clientY;
    hasMoved = false;
    isDragging = false;

    const rect = card.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    card.setPointerCapture(e.pointerId);
  });

  card.addEventListener("pointermove", (e) => {
    if (!pointerDown) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!isDragging && Math.sqrt(dx * dx + dy * dy) > 15) {
      isDragging = true;
      hasMoved = true;

      const computedStyle = window.getComputedStyle(card);
      card.style.width = computedStyle.width;
      card.style.height = computedStyle.height;
      card.style.position = "fixed";
      card.style.zIndex = "1000";
      card.style.opacity = "0.5";
    }

    if (isDragging) {
      e.preventDefault();
      card.style.left = `${e.clientX - offsetX}px`;
      card.style.top = `${e.clientY - offsetY}px`;

      document.querySelectorAll(".task").forEach((col) => col.classList.remove("drag-over"));
      const dragOverColumn = document.elementsFromPoint(e.clientX, e.clientY).find((el) =>
        el.classList?.contains("task")
      );
      if (dragOverColumn) {
        dragOverColumn.classList.add("drag-over");
      }
    }
  });

  card.addEventListener("pointerup", async (e) => {
    pointerDown = false;
    card.releasePointerCapture(e.pointerId);
    document.querySelectorAll(".task").forEach((col) => col.classList.remove("drag-over"));

    if (!hasMoved) {
      window.location.href = `./edit.html?id=${card.dataset.id}`;
      return;
    }

    const dropZone = document.elementsFromPoint(e.clientX, e.clientY).find((el) =>
      el.classList?.contains("task")
    );

    card.style.position = "";
    card.style.left = "";
    card.style.top = "";
    card.style.zIndex = "";
    card.style.width = "";
    card.style.height = "";
    card.style.opacity = "";

    if (dropZone) {
      const columnId = dropZone.id;
      const cardId = card.dataset.id;
      const name = card.innerText;
      const description = card.dataset.description || "";
      const formContainer = dropZone.querySelector("#formContainer");
      if (formContainer) {
        dropZone.insertBefore(card, formContainer);
      } else {
        dropZone.appendChild(card);
      }
      try {
        await updateTask(currentUser, cardId, name, columnId, description);
      } catch (e) {
        console.error("Failed to update task:", e);
        alert("Failed to update task in database.");
      }
    }
  });
}