// Task Status Management Section
let tasks = [];
let filteredTasks = [];
let selectedState;
let keywordsSelected = [];


// START Renderizado en UI
const generateStateListHTML = (label, key, states = [], exclude = null, entity) => {
    return `<div class="btn-group">
                <button type="button" class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    ${label}
                </button>
                <ul class="dropdown-menu" id="dropdown-${key}" name="dropdown-${key}">
                    ${states.map((s) => `<li id="${key}-${s.key}" name="${key}-${s.key}"  onclick="changeStateToTask(${entity.id}, ${s.id},${exclude ? exclude.id === s.id : false})"><a class="dropdown-item${exclude ? exclude.id === s.id ? " disabled" : "" : ""}" href="#">${s.name}</a></li>`).join("")}
                </ul>
            </div>`;
}

const renderTasksList = (identifier = "main-content", entities = []) => {
    let bodyList = document.getElementById(identifier);
    bodyList.innerHTML = "";
    if (entities.length) {
        entities.forEach((entity) => {
            let record = document.createElement("div");
            record.setAttribute("class", "alert alert-secondary");
            record.setAttribute("id", entity.id.toString());
            record.setAttribute("role", "alert");
            record.innerHTML = `
            <h5 class="alert-heading">${entity.toString()}</h5>
            <div class="row">
                <div class="col-sm-9">
                    <p class="mb-0">${entity.getFormattedDate()} <span class="badge rounded-pill bg-${entity.state.bgColorClass} p-2 border border-light rounded-circle"> </span></p>
                </div>
                <div class="col-sm-3 d-flex justify-content-end">
                    ${generateStateListHTML("Change state", entity.id, states, entity.state, entity)}
                    <button type="button" class="btn btn-secondary" onclick="deleteTask(${entity.id})" style="margin-left: 5px"><i class="bi bi-trash-fill"></i></button>
                </div>
            </div>
            `;
            bodyList.append(record);
        });
    } else {
        let record = document.createElement("div");
        record.setAttribute("class", "alert alert-warning");
        record.setAttribute("role", "alert");
        let message = "There are no tasks to show yet.";
        if (filteredTasks.length === 0 && (selectedState || keywordsSelected.length)) {
            message = "There are no tasks to display yet based on the applied filters.";
        }
        record.innerHTML = `<h5 class="alert-heading">${message}</h5>`;
        bodyList.append(record);
    }
}

// END Renderizado en UI

// START Simulación de invocación a servicios

const mappFromServiceToTask = (entity, states) => {
    return new Task(entity.id, entity.description, states.length ? states.find((st) => st.id === entity.stateId) : null, entity.date ? new Date(entity.date) : null);
}

const simulateSynchronousTasksRecovery = async (order) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            fetch("./moks/tasks.json")
                .then((resultado) => resultado.json()) // Obtuvimos la respuesta --> Tomar los datos del body (.json())
                .then((data) => {
                    // Obtenemos la colección de datos
                    if (order === ORDERS.ASC) {
                        resolve(data.map((entity) => mappFromServiceToTask(entity, states)));
                    } else {
                        resolve(data.reverse().map((entity) => mappFromServiceToTask(entity, states)));
                    }
                })
                .catch((_error) => {
                    reject("No fue posible recuperar los datos");
                });
        }, WAITING_TIME);
    });
}

const simulateSynchronousChangeStateToTasks = async (taskId, stateId) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let entityIndex = tasks.findIndex((t) => t.id === taskId);
            const newState = states.find((s) => s.id === stateId);
            if (entityIndex === -1 || !newState) {
                reject("Unable to update status")
            }
            tasks[entityIndex].state = newState;
            resolve(tasks);
        }, WAITING_TIME);
    });
}

const simulateSynchronousDeleteTasks = async (taskId) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let entityIndex = tasks.findIndex((t) => t.id === taskId);
            if (entityIndex === -1) {
                reject("Unable to delete task")
            }
            tasks = tasks.filter((t) => t.id !== taskId);
            resolve(tasks);
        }, WAITING_TIME);
    });
}

// END Simulación de invocación a servicios

// START Inicializadores

const initializeTaks = async (domIdentifier = "main-content") => {
    toggleLoadingContainer(true);
    await simulateSynchronousTasksRecovery(ORDERS.DESC).then((entities) => {
        tasks = entities;
        filteredTasks = entities;
        showSuccessMessage(["Recovered tasks"]);
        renderTasksList(domIdentifier, entities);
    }).catch((error) => {
        showErrorMessage(["Error retrieving data"]);
    }).finally(() => {
        toggleLoadingContainer(false);
    })
}

// END Inicializadores

// START Procesos

const getTask = (description) => {
    return tasks.find((e) => e.description.trim().toLowerCase() === description.trim().toLowerCase());
}

const validateTaskInputsForm = (description) => {
    const default_message = "You must enter a Description for the task.";
    if (!description) { return default_message }
    if (!description.trim().length) { return default_message }
    return null;
}

const createTask = (description = null) => {
    const validateMessage = validateTaskInputsForm(description);
    if (validateMessage !== null) {
        showErrorMessage([validateMessage]);
        return false
    }

    // Buscamos o creamos a una tarea
    let entity = getTask(description);
    if (entity) {
        showErrorMessage(["The task you are trying to add already exists!"]);
        return false;
    }
    const newEntity = new Task(generarLegajo(tasks), description, states[0]);
    tasks.unshift(newEntity);
    showSuccessMessage(["Task added!"]);
    renderTasksList("main-content", tasks);
    return true;
}

const filterTasksByDescription = (entities = [], keys = []) => {
    if (keys.length === 0) { return entities }
    return entities.filter((e) => keys.some((k) => e.description.toLowerCase().includes(k.toLowerCase())));
}

const filterTasksByState = (entities = [], state) => {
    if (!state) { return entities }
    return entities.filter((e) => e.state.id === state.id);
}

const applyAllFilters = async (keywords = [], state) => {
    return new Promise((resolve, _reject) => {
        setTimeout(() => {
            let result = tasks;
            result = filterTasksByDescription(result, keywords);
            result = filterTasksByState(result, state);
            resolve(result);
        }, 3000);
    });
}

const changeStateToTask = async (entityId, newStateId, disabled) => {
    if (disabled) { return false; }
    toggleLoadingContainer(true);
    await simulateSynchronousChangeStateToTasks(entityId, newStateId).then(async (result) => {
        filteredTasks = result;
        await applyAllFilters(keywordsSelected, selectedState).then((entities) => {
            filteredTasks = entities;
            showSuccessMessage(["Status changed!"]);
            renderTasksList("main-content", filteredTasks);
        }).finally(() => {
            toggleLoadingContainer(false);
            return;
        });
    }).catch((error) => {
        showErrorMessage([error]);
    }).finally(() => {
        toggleLoadingContainer(false);
    })
}

const deleteTask = async (entityId) => {
    toggleLoadingContainer(true);
    await simulateSynchronousDeleteTasks(entityId).then(async (result) => {
        filteredTasks = result;
        await applyAllFilters(keywordsSelected, selectedState).then((entities) => {
            filteredTasks = entities;
            showSuccessMessage(["Task deleted!"]);
            renderTasksList("main-content", filteredTasks);
        }).finally(() => {
            toggleLoadingContainer(false);
            return;
        });
    }).catch((error) => {
        showErrorMessage([error]);
    }).finally(() => {
        toggleLoadingContainer(false);
    })
}

// END Procesos

// START Definición de formularios y eventos
const taskForm = document.getElementById("task-form");

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const description = taskForm.children[0].value;
    if (createTask(description)) {
        taskForm.reset();
    }
});

const filterTasksForm = document.getElementById("filter-tasks-form");

filterTasksForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    let term = document.getElementById("filter-tasks-form-term").value;
    let keys = [];
    toggleLoadingContainer(true);
    if (!term) {
        keywordsSelected = [];
        await applyAllFilters(keywordsSelected, selectedState).then((entities) => {
            filteredTasks = entities;
            renderTasksList("main-content", filteredTasks);
        }).finally(() => {
            toggleLoadingContainer(false);
            return;
        });
    }
    term = term.trim();
    if (!term) { return; }
    keys = term.split(" ");
    keywordsSelected = keys.filter((k) => !!k.trim());
    await applyAllFilters(keywordsSelected, selectedState).then((entities) => {
        filteredTasks = entities;
        renderTasksList("main-content", filteredTasks);
    }).finally(() => toggleLoadingContainer(false));
});

filterTasksForm.addEventListener("reset", async (event) => {
    event.preventDefault();
    toggleLoadingContainer(true);
    keywordsSelected = [];
    selectedState = undefined;
    await applyAllFilters(keywordsSelected, selectedState).then((entities) => {
        filteredTasks = entities;
        renderTasksList("main-content", filteredTasks);
    }).finally(() => {
        document.getElementById("filter-tasks-form-term").value = "";
        stateRadios[0].checked = true;
        toggleLoadingContainer(false);
        return;
    });
});

const stateRadios = document.querySelectorAll('input[type="radio"][name="btnStateRadio"]');

stateRadios.forEach(btn => {
    btn.addEventListener("change", async (event) => {
        event.preventDefault();
        const selected = event.target.id;
        selectedState = states.find((s) => selected.toLowerCase().includes(s.key.toLowerCase()));
        toggleLoadingContainer(true)
        await applyAllFilters(keywordsSelected, selectedState).then((entities) => {
            filteredTasks = entities;
            renderTasksList("main-content", filteredTasks);
        }).finally(() => toggleLoadingContainer(false));
    });
});
// END Definición de formularios y eventos