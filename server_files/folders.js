const express = require('express')
const fs = require('fs');
const repositoryPath = require('./repositoryPath')

const router = express.Router()


router.post("/newFolder", (req, res) => {

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



module.exports = router;