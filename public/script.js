var isDeleteModeOn = false;
const deleteButton = document.getElementById('deleteModeButton');

deleteButton.addEventListener('click', () => {
    isDeleteModeOn = !isDeleteModeOn;
    deleteButton.textContent = isDeleteModeOn ? 'Exit Delete Mode' : 'Enter Delete Mode';
});

const widgets = [];

async function loadWidgets() {
    try {
      const response = await fetch('widgets.json');
      const widgets = await response.json();
      const container = document.getElementById('widgetContainer');
      container.innerHTML = '';

      widgets.forEach(widget => {

        const widgetElement = document.createElement('div');
        widgetElement.classList.add('widget');

        widgetElement.innerHTML = `
        <a href="${widget.link}">
          <img src="${widget.image}" alt="${widget.title}">
          <h3>${widget.title}</h3>
        </a>
        `;
        container.appendChild(widgetElement);
      });

    } 
    catch (error) {
      console.error('Error loading widgets:', error);
    }
  }

  document.getElementById('widgetForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    try {
      const response = await fetch('/upload-widget', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Widget added successfully!');
        loadWidgets();
        event.target.reset();
      } 
      else {
        alert('Failed to add widget.');
      }
    } 
    catch (error) {
      console.error('Error uploading widget:', error);
    }
  });

  loadWidgets();