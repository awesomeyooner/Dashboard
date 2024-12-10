var isDeleteModeOn = false;
const deleteButton = document.getElementById('deleteModeButton');

deleteButton.addEventListener('click', () => {
    isDeleteModeOn = !isDeleteModeOn;
    deleteButton.textContent = isDeleteModeOn ? 'Exit Delete Mode' : 'Enter Delete Mode';
});

var widgets = [];
//populate array
repopulateWidgets();

function repopulateWidgets(){
  fetch('/widgets.json')
    .then(response => response.json())
    .then(data => {
      widgets = data; // Populate the widgets array with the data from the server
      loadWidgets(); // Render the widgets after fetching the data
    })
    .catch(error => {
      console.error('Error loading widgets:', error);
    });
}

async function loadWidgets() {
    try {
      const container = document.getElementById('widgetContainer');
      container.innerHTML = '';

      widgets.forEach((widget, index) => {
        const widgetElement = document.createElement('div');
        widgetElement.classList.add('widget');

        widgetElement.innerHTML = `
        <a href="${widget.link}">
          <img src="${widget.image}" alt="${widget.title}">
          <h3>${widget.title}</h3>
        </a>
        `;

      widgetElement.addEventListener('click', (event) => {
        if (isDeleteModeOn) {
          event.preventDefault();
          removeWidget(index); // Remove the widget from the array and JSON
        }
      });

        container.appendChild(widgetElement);
      });

    } 
    catch (error) {
      console.error('Error loading widgets:', error);
    }
  }

  function removeWidget(index){

    if(confirm("Are you sure you want to remove this Widget?")){
      widgets.splice(index, 1);
    }

    // Update widgets.json
    fetch('/update-widgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(widgets), // Send the updated widgets array
    })
    .then(data => {
      console.log('Widget removed:', data);
      repopulateWidgets();
      loadWidgets(); // Re-render widgets after removal
    })
    .catch(error => console.error('Error removing widget:', error));
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
        repopulateWidgets();
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