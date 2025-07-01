import { auth } from "./firebaseConfig.js";
import { getTask, updateTask, removeTask } from "./database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const taskId = urlParams.get("id");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "index.html";
      return;
    }

    const task = await getTask(user, taskId);
    if (task) {
      document.getElementById("taskName").value = task.name;
      document.getElementById("description").value = task.description;
    }

    document.getElementById("editForm").addEventListener("submit", async (e) => {
      e.preventDefault();

      const updatedName = document.getElementById("taskName").value;
      const updatedDesc = document.getElementById("description").value;

      if (task) {
        try {
          await updateTask(user, taskId, updatedName, task.column, updatedDesc);
          window.location.href = "tasks.html";
        } catch (error) {
          console.error("Failed to update task:", error);
          alert("Failed to update task.");
        }
      }
    });

    document.getElementById("delete").addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await removeTask(user, taskId);
        window.location.href = "tasks.html";
      } catch (error) {
        console.error("Failed to delete task:", error);
        alert("Failed to delete task.");
      }
    });
  });
});