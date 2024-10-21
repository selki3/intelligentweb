# intelligent-web-assignment
Assignment for intelligent web
## Initial setup

 Assuming you are using webstorm:
 * Open the project from the solution directory
 * Go to the main project directory
 * Run npm install to install all neccessary packages 
 * Run mongoDB server on port '27017'
 * Go to [http://localhost:3000](http://localhost:3000) to view the application
 
## Pages

 ### NOTE: nicknames
 * To change your nickname, simply type a new one in and hit go
 * Regardless of your nickname, any sighting uploaded in your browser will belong to you through the use of signatures

 
 ### View Sightings
 * On the homepage, there is a list of all sightings
 * To view a sighting in more detail click the "see more" link 
 * Each sighting has a page with its details, the possibility to suggest other identifications, and facts such as its species and genus (from the knowledge graph)
 * If you are the original uploader of the sighting, you are able to edit the identification and the image
 * If you did not upload the sighting, you cannot modify any details of the sighting

 ### Add A New Sighting
 * Go to "add sighting" page by following the "add sighting" link on the navbar
 * Choose a suitable identification in the from the dropdown box and add a description
 * The location can be chosen by the map or by typing in coordinates
 * Optionally, an image can be added; if not, a default image will be displayed
 * Sightings can be added offline but images will not be uploaded; you can come back and add this when you are back online
 

 ### Chat 
 * At the bottom of every sighting page there is a chat section
 * It supports online and offline interaction
 * Chats sent offline will be sent as soon as the browser gets a connection, if you cannot see this, try refreshing the page

 
 ### Offline use
 * The web app loads previously viewed pages offline
 * It is possible to send a chat message offline
 * The app allows sightings to be added offline

### Progressive Web Application
 * This web application can be installed with the button in the search bar of your browser

### Responsive design
 * This web application has been designed with all devices in mind
 * The application is usable on mobile, ipad, and laptops/desktops

## More Details on Functionality

### Verification of upload
When uploading a bird sighting, your browser will store a token or signature proving that you have created the sighting. When you try to modify a sighting, you will send all your tokens to the server to verify that one of your tokens matches the upload signature in the servers database record.

### Caching
We have used a network first approach in this web application to ensure the user gets the most up-to-date information about new sightings. Anything that the user views online will be cached; this is not ideal, as we had hoped to filter what was cached.

### Offline usage
When using the application offline, you will be limited to what you have seen before. You have the ability to go on any page you have previously viewed. You can send chats (although you cannot see the history) and you can upload new bird sightings. When you have sent a chat or uploaded a bird sighting, the data will be stored in indexedDB. As soon as you come back online, everything (multiple chats and multiple bird sightings) will be uploaded for everybody else to see. When you have uploaded a sighting offline, you may notice that the formatting for your sighting is not the same as all the other ones. This indicates that your sighting has not yet been uploaded to the server. Once you are back online, your sighting will be uploaded and it will look like all the other sightings once you have refreshed your home page.
