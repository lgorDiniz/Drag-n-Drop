document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get("id");
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const task = tasks.find(t => t.id === taskId);

    if (task) {
        document.getElementById("taskName").value = task.taskName;
        document.getElementById("description").value = task.description;
    }

    document.getElementById("editForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const updatedName = document.getElementById("taskName").value;
        const updatedDesc = document.getElementById("description").value;

        if (task) {
            task.taskName = updatedName;
            task.description = updatedDesc;
            localStorage.setItem("tasks", JSON.stringify(tasks));
            window.location.href = "index.html";
        }
    });

    document.getElementById("delete").addEventListener("click", (e) => {
        e.preventDefault();
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        localStorage.setItem("tasks", JSON.stringify(updatedTasks));
        window.location.href = "index.html";
    });
});
