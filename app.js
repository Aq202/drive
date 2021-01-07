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

const repositoryPath = 'D:/diego/OneDrive/Documents/Transferencia de Archivos/';

const storage = multer.diskStorage({
    destination: repositoryPath,
    filename: function (req, file, callback) {
        callback(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage: storage });


app.get('/', (req, res) => {

    res.sendFile(__dirname + '/public/fileTransfer.html')
});

app.post('/uploadFile', upload.array("file"), (req, res) => {
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
    console.log("Infoooo ", req.body)
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


app.listen(2002, () => {
    console.log("Servidor corriendo en el puerto 2002")
})


const renameFile = (route, newName) => {

    let promise = new Promise((res, rej) => {
        let newRoute = route.replace(path.basename(route), newName)
        let ext = "";
        if (fs.lstatSync(repositoryPath + route).isDirectory() === false) ext = path.extname(route);

        fs.rename(repositoryPath + route, repositoryPath + newRoute + ext, err => {
            if (err) {
                console.log("ocurrió un erro al renombrar:: ", err)
                rej(err)
            } else {
                console.log("todo cool", {
                    old: repositoryPath + route,
                    new: repositoryPath + newRoute + ext
                })
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
