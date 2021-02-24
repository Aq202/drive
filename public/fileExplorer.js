

document.addEventListener("DOMContentLoaded", e => {

    new PathClass("", "Archivos")
});

class Archivo {

    constructor(name, path, isDirectory, ext) {
        this.name = name;
        this.path = path
        this.isDirectory = isDirectory;
        this.ext = ext;
        this.pressKey = true;
        this.selectImage();
        this.addFile();
    }

    addFile() {

        //creando el elemento
        const container = document.createElement("DIV");
        container.innerHTML = `<div class="icon ${this.image}"></div>
                                <div class="file-name">
                                    <span class="name">${this.name}</span>
                                    <span class="ext">${this.ext}</span>
                                </div>
                                <div class="edit"></div>
                                <div class="delete"></div>`;

        const filesList = document.getElementById("filesList");

        //agregando eventos
        this.addEvents(container);




        if (filesList) filesList.appendChild(container);

    }

    selectImage() {

        if (this.isDirectory == true) {
            this.image = "directory";
        } else {
            let ext = this.ext.trim();
            if (ext.startsWith(".")) ext = ext.substring(1);

            if (ext == "png" || ext == "jpg" || ext == "jpeg" || ext == "gif") {
                this.image = "image";
            } else {
                this.image = "doc"
            }
        }

    }



    addEvents(container) {

        //Opcion de descargar o abrir fichero

        if (this.isDirectory == false) {
            container.addEventListener("click", e => {
                try {
                    if (this.pressKey === true) {
                        this.download();
                    }
                } catch (e) { }
            })
        } else {
            container.addEventListener("click", e => {
                try {
                    if (this.pressKey === true) {
                        PathClass.showPath(this.path)
                    }
                } catch (ex) { }
            })
        }

        //opcion de mostrar/ocultar botones ocultos


        const mouseDown = e => {

            setTimeout(() => {
                console.log("Presionado")
                this.pressKey = false;
            }, 500)
        }

        container.addEventListener("mousedown", mouseDown)
        container.addEventListener("pointerdown", mouseDown)

        const mouseUp = e => {

            if (this.pressKey === false) {

                container.classList.add("hiddenButtons")

                const hideButtons = e => {
                    let result = false;
                    e.path.forEach(elem => {
                        if (elem == container) result = true;
                    })

                    if (!result) {
                        container.classList.remove("hiddenButtons")
                        this.pressKey = true;
                    }
                }

                document.querySelector("body").addEventListener("mousedown", hideButtons)
                document.querySelector("body").addEventListener("pointerdown", hideButtons)

            }

        }

        container.addEventListener("mouseup", mouseUp)
        container.addEventListener("pointerup", mouseUp)

        //opcion de editar y eliminar archivo
        const editButton = container.querySelector(".edit")
        if (editButton) {
            editButton.addEventListener("click", e => {
                this.rename(prompt("Ingrese el nuevo nombre del archivo: "), container)
            })
        }

        const deleteButton = container.querySelector(".delete")
        if (deleteButton) {
            deleteButton.addEventListener("click", e => {
                let mensaje = "¿Deseas eliminar este archivo?";
                if (this.isDirectory) mensaje = "¿Deseas eliminar esta carpeta y todos los archivos que esta contiene?";

                if (confirm(mensaje)) {
                    this.delete(container)
                }
            })
        }
    }

    download() {

        let url = "/download/" + this.path.replaceAll("/", "---");
        window.location = url;
    }

    rename(newName, HTMLObject) {
        let info = {
            ruta: this.path,
            newName: newName
        }
        fetch("/rename", {
            method: "POST",
            body: JSON.stringify(info),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(r => {
                if (r.ok === true) {

                    HTMLObject.querySelector("span.name").innerText = newName;

                }

                HTMLObject.classList.remove("hiddenButtons")
                this.pressKey = true;
            })
            .catch(err => console.warn("Error al renombrar el archivo::", err))

    }

    delete(HTMLObject) {

        let info = {
            path: this.path,
        }
        fetch("/deleteFile", {
            method: "POST",
            body: JSON.stringify(info),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(r => {
                if (r.ok === true) {

                    HTMLObject.remove();

                }


            })
            .catch(err => console.warn("Error al eliminar archivo::", err))

    }


    static setFilesList(path) {
        let url = "/getFilesList";
        let obj = {
            path: path
        }

        fetch(url, {
            method: "POST",
            body: JSON.stringify(obj),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(r => r.json())
            .then(res => {

                if (res.state === true) {
                    const filesList = document.getElementById("filesList");
                    if (filesList) filesList.innerHTML = "";

                    res.result.forEach(file => {
                        new Archivo(file.name, file.path, file.isDirectory, file.ext)
                    })
                }

            }).catch(err => console.warn("Error al obtener lista de archivos::", err))
    }
}

