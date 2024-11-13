class State {
  constructor(id, name, textColorClass, bgColorClass, key) {
    this.id = id;
    this.name = name.trim();
    this.tasks = [];
    this.textColorClass = textColorClass;
    this.bgColorClass = bgColorClass;
    this.key = key;
  }

  toString() {
    return this.name.toUpperCase();
  }

  setTasks(tasks = []) {
    this.tasks = tasks;
  }

  addTask(task) {
    if (
      task &&
      !this.tasks.find((element) => element.id === task.id)
    ) {
      this.tasks.push(unaCatedra);
    }
  }
}
