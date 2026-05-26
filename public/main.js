const app = document.querySelector('#app')
const input = app.querySelector('#task-input')
const addButton = app.querySelector('#add-button')
const list = app.querySelector('#list')
const itemTemplate = list.querySelector('template')

async function fetchTasks() {
  const response = await fetch('/api/tasks')
  const tasks = await response.json()

  list.querySelectorAll('li').forEach(li => li.remove())

  tasks.forEach(task => {
    const taskDom = createDomTask(task.title, task.id)
    list.appendChild(taskDom)
  })
}

function createDomTask(title, id) {
  const task = itemTemplate.content.cloneNode(true)
  const li = task.querySelector('li')

  li.dataset.id = id
  task.querySelector('.title').textContent = title

  task.querySelector('.bt-delete').addEventListener('click', async (e) => {
    const targetLi = e.target.closest('li')
    const taskId = targetLi.dataset.id

    const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    if (response.ok) {
      targetLi.remove()
    }
  })

  return task
}

async function createNewTask() {
  const title = input.value.trim()
  if (!title) return

  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  })

  if (response.ok) {
    const newTask = await response.json()
    const taskDom = createDomTask(newTask.title, newTask.id)
    list.appendChild(taskDom)
    input.value = ''
  }
}

addButton.addEventListener('click', createNewTask)
input.addEventListener('keypress', e => (e.key === 'Enter' ? createNewTask() : null))

fetchTasks()