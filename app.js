const express = require('express');
const bodyParser = require('body-parser')
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const rimraf = require('rimraf');

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
        if (err) { return res.send({ state: false }) }


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
        renameFile(path, newName).then(newPath => {
            res.status(200).send({ state: true, newPath: newPath })
        }).catch(err => {
            console.log("error en 95:: ", err)
            res.status(400).send({ state: false })
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

                if (err.code == "EPERM") {
                    rimraf(repositoryPath + path, err => {
                        if (err) return res.status(400).send("");
                        return res.status(200).send("")

                    })
                } else {
                    return res.status(400).send("");
                }
            } else {
                return res.status(200).send("")
            }

        })
    } catch (ex) {
        console.log("error en 118:: ", ex)
    }
})

app.post("/newFolder", (req, res) => {

    relativePath = req.body.path + req.body.folderName;
    absolutePath = repositoryPath + relativePath;

    createFolder(absolutePath, 0).then(r => {
        res.send({ state: true, path: relativePath })
    }, r => {
        return res.send({ state: false })
    })

})

const createFolder = (path, cont) => {
    return new Promise((resolve, reject) => {

        let newPath = path;
        if (cont != 0) newPath += `(${cont})`;

        fs.mkdir(newPath, err => {
            if (err) {

                if (err.code == 'EEXIST') {
                    createFolder(path, parseInt(cont) + 1).then(result => {
                        return resolve(result)
                    }, result => {
                        return reject(result)
                    })
                } else {
                    return reject(false)
                }

            }
            return resolve(true)
        })

    })
}


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
                return rej(err)
            }
            return res(newRoute + ext)
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
