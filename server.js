const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
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
app.use(express.text());
app.use(express.static('public'));

// Serve the main page
app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function downloadImage(name, url){
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });

      // Create a unique filename using uuid
      const fileName = `${name}.png`; // You can use other image formats, depending on the file extension
      const filePath = path.join(__dirname, 'public/images', fileName);

      // Write the image data to a file
      fs.writeFileSync(filePath, response.data);
      
      return `images/${fileName}`; // Return the path of the saved image
    } 
    catch (error) {
      throw new Error('Error downloading image: ' + error.message);
    }
}

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
app.post('/upload-widget', upload.single('image'), async (request, response) => {

    var { title, link, image_url} = request.body;
    var image;// = request.file ? `images/${request.file.filename}` : 'images/patrick.png';

    if(request.file) //if the file exists
      image = `images/${request.file.filename}`;
    else if(image_url) //if image_url exists
      image = await downloadImage(title, image_url);
    else //fallback
      image = 'images/patrick.png';
    
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
