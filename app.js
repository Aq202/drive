const express = require('express');
const bodyParser = require('body-parser')

const files = require('./server_files/files');
const folders = require('./server_files/folders');

const app = express();

//middleWares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./public'))
app.use('/favicon.ico', express.static('./public/imagenes/favicon.ico'))

//routers
app.use(files)
app.use(folders)


app.get('/', (req, res) => {

    res.sendFile(__dirname + '/public/fileTransfer.html')
});










app.listen(2002, err => {
    console.log("Servidor corriendo en el puerto 2002")
})