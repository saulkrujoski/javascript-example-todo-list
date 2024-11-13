/**
 *
 * @param {*} messages Colección de mensajes representados por cadenas de texto en un array
 * @param {*} type Tipo de estilo esperado para mostrar en pantalla: success | danger
 * @param {*} title Título que acompañará al mensaje en la pantalla para ofrecer contexto
 */
function showMessage(
  messages = [],
  type = "success",
  title = "Título no definido"
) {
  let messageBody = document.createElement("div");
  messageBody.setAttribute("class", `alert alert-${type}`);

  // Agregaremos un Título
  let messageTitle = document.createElement("h6");
  messageTitle.innerText = title;
  messageBody.append(messageTitle);

  // Agregaremos un divisor entre el título y los mensajes
  let messageDivider = document.createElement("hr");
  messageBody.append(messageDivider);

  // Añadimos unos a uno los mensajes
  messages.forEach((msjs) => {
    let messageItem = document.createElement("p");
    messageItem.setAttribute("class", "mb-0");
    messageItem.innerText = msjs;
    messageBody.append(messageItem);
  });

  // Construcción de la Notificación
  Toastify({
    node: messageBody,
    duration: 5000,
    gravity: "top", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    style: {
      background: "transparent",
      "box-shadow": "none",
      padding: "0px",
      margin: "0px"
    },
  }).showToast();
}

/**
 *
 * @param {*} messages Mostrar en pantalla mensajes con un estilo success
 */
function showSuccessMessage(messages = [], title = "Operación exitosa") {
  showMessage(messages, "success", title);
}

/**
 *
 * @param {*} messages Mostrar en pantalla mensajes con un estilo danger
 */
function showErrorMessage(messages = [], title = "Encontramos errores :(") {
  showMessage(messages, "danger", title);
}
