class Task {
  constructor(id, description, state, date) {
    this.id = id;
    this.description = description.trim();
    this.state = state;
    this.date = date ? date : new Date()
  }

  toString() {
    return this.description;
  }

  getFormattedDate() {
    if (!this.date) { return "Date not defined" }
    const formattedDate = this.date.toLocaleDateString('es-ES', { year: "numeric", month: "long", day: "numeric", weekday: "long" })
    /* const formattedDate = this.date.toLocaleDateString('es-ES', { // Configura para formato español
      day: '2-digit',          // Día en dos dígitos
      month: '2-digit',        // Mes en dos dígitos
      year: 'numeric'          // Año completo
    }); */
    return formattedDate
  }
}
