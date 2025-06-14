document.addEventListener("DOMContentLoaded", () => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(renderTask);

    const addButton = document.querySelector("#todo #showForm");
    const fillForm = document.querySelector("#taskForm");
    const formButton = document.querySelector("#addTask");
    const taskText = document.querySelector("#inputBar");

    addButton.addEventListener("click", () => {
        fillForm.style.display = "flex"
    })

    function renderTask(task) {
        const taskElement = document.createElement("div");
        taskElement.classList.add("card");
        taskElement.innerText = task.taskName;
        taskElement.dataset.id = task.id;
        attachDragHandlers(taskElement);
    
        const column = document.querySelector(`#${task.column}`);
        const formContainer = column.querySelector("#formContainer");
        if (column.id === "todo" && formContainer) {
            column.insertBefore(taskElement, formContainer);
        } 
        else {
            column.appendChild(taskElement);
        }
    }

    function saveTaskToLocalStorage(task) {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks.push(task);
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    formButton.addEventListener("click", () =>{
        const taskName = taskText.value.trim();
        if (!taskName) return;

        const task = {
            id: crypto.randomUUID(),
            taskName: taskName,
            description: "",
            column: "todo"
        };

        saveTaskToLocalStorage(task);
        renderTask(task);

        taskText.value = "";
        fillForm.style.display = "none";
    })

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

        card.addEventListener("pointerup", (e) => {
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

            let originalParent;

            if (!dropZone && originalParent) {
                originalParent = card.parentElement;
                originalParent.appendChild(card);
            }
        
            if (dropZone) {
                const columnId = dropZone.id;
                const cardId = card.dataset.id;
                const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
                const task = tasks.find(t => t.id === cardId);
        
                if (task) {
                    task.column = columnId;
        
                    task.taskName = card.innerText;
        
                    localStorage.setItem("tasks", JSON.stringify(tasks));
                }
        
                const formContainer = dropZone.querySelector("#formContainer");
                if (dropZone.id === "todo" && formContainer) {
                    dropZone.insertBefore(card, formContainer);
                } else {
                    dropZone.appendChild(card);
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
})