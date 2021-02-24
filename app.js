const express = require('express');
const bodyParser = require('body-parser')
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const app = express();

//middleWares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./public'))
app.use('/favicon.ico', express.static('./public/imagenes/favicon.ico'))

const repositoryPath = 'D:/diego/OneDrive/Documents/Transferencia de Archivos/';

const storage = multer.diskStorage({
    destination: repositoryPath,
    filename: function (req, file, callback) {
        // callback(null, Date.now() + "-" + file.originalname);

        if (req.params.path !== undefined && req.params.path !== null && req.params.path !== "*") {
            callback(null, req.params.path.replace(/---/g, "/") + file.originalname);
        } else {
            callback(null, file.originalname);
        }
    }
});
const upload = multer({ storage: storage });


app.get('/', (req, res) => {

    res.sendFile(__dirname + '/public/fileTransfer.html')
});

app.post('/uploadFile/:path', upload.array("file"), (req, res) => {

    res.send("ok")
});

app.post('/getFilesList', (req, res) => {

    let route;
    if (req.body.path.trim().length > 0) {
        route = repositoryPath + req.body.path + "/";
    } else {
        route = repositoryPath;
    }

    fs.readdir(route, (err, files) => {
        if (err) { res.send({ state: false }) }

        const result = [];
        files.forEach(file => {
            let fileRoute;
            if (req.body.path.trim().length > 0) {
                fileRoute = req.body.path + "/" + file;
            } else {
                fileRoute = file;
            }

            let obj = { name: path.basename(file, path.extname(file)), path: fileRoute }

            if (fs.lstatSync(route + file).isDirectory()) {
                obj.isDirectory = true;
                obj.ext = "";
            } else {
                obj.isDirectory = false;
                obj.ext = path.extname(file);
            }

            result.push(obj);
        })

        res.send({ state: true, result: result })
    })
});


app.get('/download/:path', (req, res) => {


    res.download(repositoryPath + req.params.path.replace(/---/g, "/"), function (err) {
        if (err) {
            console.log("ERROR: ", err)
        } else {
            console.log("listo")
        }
    })

})

app.post("/rename", (req, res) => {

    let path = req.body.ruta;
    let newName = req.body.newName;

    if (path != undefined && newName != undefined) {
        renameFile(path, newName).then(() => {
            res.status(200).send("")
        }).catch(err => {
            console.log("error en 95:: ", err)
            res.status(400).send(err)
        })

    } else {
        res.status(400).send("")
    }
})

app.post("/deleteFile", (req, res) => {
    //falta funcionalidad para eliminar carpetas
    let path = req.body.path;
    console.log(path)

    if (path === undefined) res.status(400).send("");
    try {
        fs.unlink(repositoryPath + path, err => {
            if (err) {
                console.log("existe error che ", err)
                res.status(400).send("");
            } else {
                res.status(200).send("")
            }

        })
    } catch (ex) {
        console.log("error en 118:: ", ex)
    }
})


app.listen(2002, () => {
    console.log("Servidor corriendo en el puerto 2002")
})


const renameFile = (route, newName) => {

    let promise = new Promise((res, rej) => {
        let newRoute = route.replace(new RegExp(path.basename(route) + '$', 'i'), newName)
        let ext = "";
        if (fs.lstatSync(repositoryPath + route).isDirectory() === false) ext = path.extname(route);

        fs.rename(repositoryPath + route, repositoryPath + newRoute + ext, err => {
            if (err) {
                rej(err)
            }
            res("ok")
        })
    })
    return promise;
}


/*const route =  "D:/diego/OneDrive/Documents/Transferencia de Archivos";
fs.readdir(route, function (err, archivos) {
if (err) {
console.log(err)
return;
}

    archivos.forEach(file =>{

        let fileRoute = route + "/" + file;
        console.log(fs.lstatSync(fileRoute).isDirectory(), fileRoute)
    })

}); */
