import { addTask, getTasks, updateTask } from "./database.js";


document.addEventListener("DOMContentLoaded", async () => {
    const tasks = await getTasks();
    tasks.forEach(renderTask);

    const addButton = document.querySelector("#todo #showForm");
    const fillForm = document.querySelector("#taskForm");
    const formButton = document.querySelector("#addTask");
    const taskText = document.querySelector("#inputBar");
    let draggedCard = null;

    addButton.addEventListener("click", () => {
        fillForm.style.display = "flex";
    });

    function renderTask(task) {
        const taskElement = document.createElement("div");
        taskElement.classList.add("card");
        taskElement.innerText = task.name;
        taskElement.dataset.id = task.id;
        taskElement.dataset.description = task.description;
        attachDragHandlers(taskElement);

        const column = document.querySelector(`#${task.column}`);
        const formContainer = column.querySelector("#formContainer");
        if (column.id === "todo" && formContainer) {
            column.insertBefore(taskElement, formContainer);
        } else {
            column.appendChild(taskElement);
        }
    }

    formButton.addEventListener("click", async () => {
        const taskName = taskText.value.trim();
        if (!taskName) return;

        const tempId = "temp-" + Date.now();
        const tempTask = {
            id: tempId,
            name: taskName,
            column: "todo",
            description: ""
        };

        renderTask(tempTask);

        taskText.value = "";
        fillForm.style.display = "none";

        try {
            const realTask = await addTask(taskName, "todo", "");
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

    function attachDragHandlers(card) {
        let isDragging = false;
        let hasMoved = false;
        let offsetX = 0, offsetY = 0;
        let startX = 0, startY = 0;
        let pointerDown = false;

        card.addEventListener("pointerdown", (e) => {
            pointerDown = true;
            startX = e.clientX;
            startY = e.clientY;
            hasMoved = false;
            isDragging = false;
            draggedCard = card;

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
                card.style.pointerEvents = "auto";
            }

            if (isDragging) {
                e.preventDefault();
                card.style.left = `${e.clientX - offsetX}px`;
                card.style.top = `${e.clientY - offsetY}px`;

                const elements = document.elementsFromPoint(e.clientX, e.clientY);
                document.querySelectorAll(".task").forEach(col => col.classList.remove("drag-over"));

                const dragOverColumn = elements.find(el => el.classList?.contains("task"));
                if (dragOverColumn) {
                    dragOverColumn.classList.add("drag-over");
                }

                const scrollMargin = 50;
                const scrollSpeed = 2;

                if (e.clientY < scrollMargin) {
                    window.scrollBy(0, -scrollSpeed);
                } else if (e.clientY > window.innerHeight - scrollMargin) {
                    window.scrollBy(0, scrollSpeed);
                }
            }
        });

        card.addEventListener("pointerup", async (e) => {
            pointerDown = false;
            card.releasePointerCapture(e.pointerId);

            document.querySelectorAll(".task").forEach(col => col.classList.remove("drag-over"));
            draggedCard = null;

            if (!hasMoved) {
                window.location.href = `./edit.html?id=${card.dataset.id}`;
                return;
            }

            const elements = document.elementsFromPoint(e.clientX, e.clientY);
            const dropZone = elements.find(el => el.classList?.contains("task"));

            card.style.position = "";
            card.style.left = "";
            card.style.top = "";
            card.style.zIndex = "";
            card.style.width = "";
            card.style.height = "";
            card.style.opacity = "";
            card.style.pointerEvents = "auto";

            const originalParent = card.parentElement;

            if (!dropZone && originalParent) {
                if (originalParent.id === "todo") {
                    const formContainer = originalParent.querySelector("#formContainer");

                    if (formContainer) {
                        originalParent.insertBefore(card, formContainer);
                    } 
                    else {
                        originalParent.appendChild(card);
                    }
                } 
                else {
                    originalParent.appendChild(card);
                }
            }

            if (dropZone) {
                const columnId = dropZone.id;
                const cardId = card.dataset.id;
                const name = card.innerText;
                const description = card.dataset.description || "";

                const formContainer = dropZone.querySelector("#formContainer");
                if (dropZone.id === "todo" && formContainer) {
                    dropZone.insertBefore(card, formContainer);
                } else {
                    dropZone.appendChild(card);
                }

                try {
                    await updateTask(cardId, name, columnId, description);
                } catch (e) {
                    console.error("Failed to update task:", e);
                    alert("Failed to update task in database.");
                    originalParent.appendChild(card);
                }
            }

            isDragging = false;
            hasMoved = false;
        });

        card.addEventListener("pointerleave", () => {
            if (!pointerDown && isDragging) {
                card.style.position = "";
                card.style.left = "";
                card.style.top = "";
                card.style.zIndex = "";
                card.style.width = "";
                card.style.height = "";
                card.style.opacity = "";
                card.style.pointerEvents = "auto";

                isDragging = false;
                hasMoved = false;
            }

            if (draggedCard) {
                document.querySelectorAll(".task").forEach(col => col.classList.remove("drag-over"));
                draggedCard = null;
            }
        });
    }

    document.querySelectorAll(".card").forEach(attachDragHandlers);
});