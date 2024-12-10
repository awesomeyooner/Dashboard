const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (request, file, cb) => cb(null, 'public/images/'),
  filename: (request, file, cb) => cb(null, `${file.originalname}`) //`${Date.now()}-${file.originalname}`
});
const upload = multer({ storage });

app.use(bodyParser.json());
app.use(express.static('public'));

// Serve the main page
app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/update-widgets', (request, response) => {
    const updatedWidgets = request.body; // Get the updated widgets array
  
    // Update widgets.json
    fs.writeFile(path.join(__dirname, 'public/widgets.json'), JSON.stringify(updatedWidgets, null, 2), (error) => {
      if (error) {
        console.error('Error updating widgets.json:', error);
        return response.status(500).send('Error updating widgets.json');
      }
      return response.status(200).send('Widgets updated successfully');
    });
  });

// Endpoint to handle widget uploads
app.post('/upload-widget', upload.single('image'), (request, response) => {

    var { title, link} = request.body;
    var image = request.file ? `images/${request.file.filename}` : 'images/patrick.png';

    if (!title || !link) 
        return response.status(400).send('Missing required fields');
    

    // Read and update widgets.json
    fs.readFile(
        'public/widgets.json', 'utf8', 
        (error, data) => {
            if(error) 
                return response.status(500).send('Error reading widgets.json');
            
            const widgets = JSON.parse(data);
            widgets.push({ title, link, image });

            fs.writeFile(
                'public/widgets.json', 
                JSON.stringify(widgets, null, 2), 
                (error) => {
                    if(error) 
                        return response.status(500).send('Error updating widgets.json');
                    else
                        return response.status(200).send('Widget added successfully');
                }
            );
        }
    );


});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
