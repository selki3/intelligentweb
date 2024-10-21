// Import required modules
var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');

const sighting = require('../controllers/sighting');
const chat = require('../controllers/chat');
const sparql = require('../controllers/sparql.js');

// add ability to upload images
const multer = require('multer');

// define storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function(req, file, cb) {
        let fileExtension = file.originalname.split('.');
        let fileName = Date.now() + '.' + fileExtension[fileExtension.length - 1];
        cb(null, fileName);
    }
});
const upload = multer({storage: storage});

/* GET home page. */
router.get('/', function(req, res, next) {
    sighting.getAll()
        .then((result) => {
            res.render('index', {sightings: result, imagePath: '/uploads/'})
        })
        .catch((err) => {
            res.send(err);
        });
});


/* GET sighting page */
router.get('/sighting/:id', async function(req, res, next) {
    let showAlert = req.query.authenticationError === 'true';
    let id = req.params.id;

    if (!id) {
        res.redirect("/");
        return;
    }

    let sightingResult;
    let imgUrl;

    // get sighting info
    try {
        sightingResult = await sighting.withID(id);
        imgUrl = "/uploads/" + sightingResult.img;
    } catch (err) {
        res.send(err);
        return;
    }

    // fetch bird info
    let birdInfo;
    try {
        birdInfo = await sparql.fetchBirdInfo(sightingResult.identification);
    } catch (err) {
        console.error(err);
    }

    // get map image
    let mapImg;
    try {
        let mapUrl = `https://maps.openstreetmap.org/?mlat=${sightingResult.latitude}&mlon=${sightingResult.longitude}&zoom=14#map=14/${sightingResult.latitude}/${sightingResult.longitude}`;
        let mapResponse = await fetch(mapUrl);
        let mapBuffer = await mapResponse.buffer();
        mapImg = `data:image/png;base64,${mapBuffer.toString('base64')}`;
    } catch (err) {
        console.error(err);
    }

    let birdNames = await sparql.fetchAllBirds();

    // update result object with new info
    sightingResult.birdInfo = birdInfo;
    sightingResult.birdImg = imgUrl;
    sightingResult.mapImg = mapImg;

    res.render("view-sighting", {sighting: sightingResult, birdNames: birdNames, showAlert: showAlert});
});




/* GET Suggestion Page */
router.get('/suggest/:id', function(req, res, next) {
   let id = req.params.id;
   sighting.withID(id)
       .then((result) => {
           res.render('edit-sighting', {sighting: result})
       })
       .catch((err) => {
           res.send(err)
       })
});

/* GET add sighting page */
router.get('/add-sighting', async function(req, res, next) {
    let birdNames = await sparql.fetchAllBirds();

    // Pass the bird names and the selected bird name to the EJS template
    res.render('add-sighting', { birdNames: birdNames });
});



/* POST add-sighting */
router.post('/add-sighting', upload.single('imageFile'), function(req, res, next) {
    sighting.create(req, res)
        .then(sighting => {
            // Redirect to the home page after the sighting has been created
            res.redirect('/');
        })
        .catch(err => {
            // Handle any errors that occurred while creating the sighting
            console.error(err);
            res.status(500).send('An error occurred.');
        });
});

/* POST sync-sightings */
router.post('/sync-sightings', function(req, res) {
    let sightings = req.body

    for(let sight of sightings) {
        sighting.sync(sight)
            .then(r => { res.redirect('/') })
            .catch((err => {console.error(err); }))
    }
});

router.post('/redirect', function(req, res, next) {
    res.redirect('/')
});

/* POST edit-sighting */
router.post('/edit-sighting', async function(req, res, next) {

    // list of signatures from client
    let userSignatures = JSON.parse(req.body.signatures);

    // valid signature from sighting
    let sightingResult = await sighting.withID(req.body.id);
    let validSignature = sightingResult.signature;

    if (userSignatures.includes(validSignature)) {
        sighting.update(req, res)
            .then(sighting => {
                // Redirect to the home page after the sighting has been created
                res.redirect('/sighting/' + req.body.id);
            })
            .catch(err => {
                // Handle any errors that occurred while creating the sighting
                console.error(err);
                res.status(500).send('An error occurred.');
            });
    } else {
        res.redirect("/sighting/" + req.body.id + "?authenticationError=true");
    }
});

/* POST add-sighting */
router.post('/update-sighting-image', upload.single('imageFile'), async function(req, res, next) {
    // list of signatures from client
    let userSignatures = JSON.parse(req.body.signatures);

    // valid signature from sighting
    let sightingResult = await sighting.withID(req.body.id);
    let validSignature = sightingResult.signature;

    if (userSignatures.includes(validSignature)) {
        sighting.updateImg(req, res)
            .then(sighting => {
                // Redirect to the home page after the sighting has been created
                res.redirect('/sighting/' + req.body.id);
            })
            .catch(err => {
                // Handle any errors that occurred while creating the sighting
                console.error(err);
                res.status(500).send('An error occurred.');
            });
    } else {
        res.redirect("/sighting/" + req.body.id + "?authenticationError=true");
    }
});



/* GET view sighting page */
router.get('/view-sighting', function(req, res, next){
    res.render('view-sighting', {});
});

/* POST insert-chat */
router.post('/insert-chat', function(req, res, next) {
    //get id and text
    var id = req.sighting.identification
    var text = req.body.chat_input

    //use controller method
    chat.create(id, text, res)
})

module.exports = router;
