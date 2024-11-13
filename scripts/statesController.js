// Task Status Management Section
let states = [];

const simulateSynchronousStatesRecovery = async (collection) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            fetch("./moks/states.json")
                .then((resultado) => resultado.json()) // Obtuvimos la respuesta --> Tomar los datos del body (.json())
                .then((data) => {
                    // Obtenemos la colección de datos
                    resolve(data.map((entity) => new State(entity.id, entity.name, entity.textColorClass, entity.bgColorClass, entity.key)));
                })
                .catch((error) => {
                    reject(error);
                });
        }, 3000);
    });
}

const initializeStates = async (domIdentifier) => {
    //toggleLoadingContainer(true);
    await simulateSynchronousStatesRecovery().then((entities) => {
        states = entities;
    }).catch((error) => {
        console.error("Error retrieving data", error);
    }).finally(() => {
        //toggleLoadingContainer(false);
    })
}