import { getTasks, updateTask, removeTask } from "./database.js";

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get("id");
    const tasks = await getTasks();
    const task = tasks.find(t => t.id === taskId);

    if (task) {
        document.getElementById("taskName").value = task.name;
        document.getElementById("description").value = task.description;
    }

    document.getElementById("editForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const updatedName = document.getElementById("taskName").value;
        const updatedDesc = document.getElementById("description").value;

        if (task) {
            await updateTask(taskId, updatedName, task.column, updatedDesc)
            window.location.href = "index.html";
        }
    });

    document.getElementById("delete").addEventListener("click", async (e) => {
        e.preventDefault();

        await removeTask(taskId);
        window.location.href = "index.html";
    });
});
