let currentFiles = null;

document.addEventListener("DOMContentLoaded", e => {


    document.getElementById("uploadForm").addEventListener("submit", function (e) {
        e.preventDefault();

        uploadFile(this);
        hideUploadPanel();
        document.querySelector("#upload-button").setAttribute("disabled", "disabled")
        document.getElementById("upload-section").style.display = "none";

    })



    document.querySelector("#upload-button > input").addEventListener("change", e => {

        currentFiles = e.currentTarget.files;
        hideLoadingPanel();

        //agregando lista de archivos seleccionados
        const fragment = document.createDocumentFragment();
        for (file of currentFiles) {
            let span = document.createElement("SPAN");
            span.innerText = file.name;
            fragment.appendChild(span);
        }

        document.querySelector("#upload-section > div").innerHTML = "";
        document.querySelector("#upload-section > div").appendChild(fragment);
        document.getElementById("upload-section").style.display = "flex";
    })

    document.getElementById("cancel").addEventListener("click", e => {
        hideLoadingPanel();
        hideUploadPanel();
        document.getElementById("upload-section").style.display = "none";
    })

    document.getElementById("reload").addEventListener("click", e => {
        try {

            document.querySelector("div.path").innerHTML = "";
            console.log(PathClass.actualPath)
            if (PathClass.actualPath != "" && PathClass.actualPath != "/" && PathClass.actualPath != null) {
                new PathClass("", "Archivos", false)
                PathClass.showPath(PathClass.actualPath, true)
            } else {
                new PathClass("", "Archivos")
            }
        } catch (ex) {
            new PathClass("", "Archivos")
        }
    })

    document.getElementById("newFolder").addEventListener("click", e => {

        let folderName = prompt("Ingresa el nombre de la carpeta: ");
        let path = PathClass.actualPath;

        if (path == null) path = "";

        if (folderName.trim() != "") {
            let obj = {
                folderName: folderName,
                path: path
            }

            fetch("/newFolder", {
                method: "POST",
                body: JSON.stringify(obj),
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(r => r.json())
                .then(result => {
                    if (result.state == true) {
                        new Archivo(folderName, result.path, true, "")
                    }
                })
        }
    })




})


const uploadFile = form => {
    let request = new XMLHttpRequest();
    let loadingBar = document.createElement("DIV");

    let path = "";
    try {
        path = PathClass.actualPath.replaceAll("/", "---");
    } catch (ex) { }

    request.upload.addEventListener("loadstart", e => {

        //Agregando nuevo panel de carga
        loadingBar.classList.add("loading-section")
        loadingBar.innerHTML = `<div class="loading-bar">
                                    <div></div>
                                    <span></span>
                                </div>
                                <button class="cancel-button">Cancelar</button>`;

        loadingBar.querySelector(".cancel-button").addEventListener("click", e => {
            e.preventDefault();
            request.abort();
            loadingBar.querySelector(".loading-bar").classList.add("red-bar");
            loadingBar.querySelector(".loading-bar span").innerText = "Cancelado";
            document.querySelector("#upload-button").removeAttribute("disabled")
        });

        document.getElementById("uploadForm").appendChild(loadingBar);
    })

    request.upload.addEventListener("progress", e => {
        let percent = Math.round((e.loaded / e.total) * 100);
        let loadingBar = document.querySelector(".loading-section");

        if (loadingBar) {
            loadingBar.querySelector(".loading-bar div").style.width = percent + "%";
            loadingBar.querySelector(".loading-bar span").innerText = percent + "%";
        }
    })

    request.addEventListener("load", e => {
        let loadingBar = document.querySelector(".loading-section");

        if (loadingBar) {
            loadingBar.querySelector(".loading-bar div").style.width = "100%";
            loadingBar.querySelector(".loading-bar span").innerText = "COMPLETADO";
        }
        document.querySelector("#upload-button").removeAttribute("disabled")


        //cargando los iconos de los archivos
        console.log(currentFiles)
        if (currentFiles !== null) {
            for (file of currentFiles) {
                let name = file.name.replace(file.name.replace(/^.*\./, ''), "")
                new Archivo(name, path + file.name, false, file.name.replace(/^.*\./, ''))
            }
        }

    })

    request.upload.addEventListener("loadend", e => {
        loadingBar.querySelector(".cancel-button").remove();
    })

    request.addEventListener("abort", e => {
        loadingBar.querySelector(".cancel-button").remove();
    })


    if (path !== "" && path != undefined && path != null) {
        request.open('post', '/uploadFile/' + path);
    } else {
        request.open('post', '/uploadFile/*');
    }

    request.send(new FormData(form))
}

const hideLoadingPanel = () => {
    //Eliminando paneles de carga anteriores
    let panel = document.querySelectorAll(".loading-section");
    if (panel) panel.forEach(panel => panel.remove());
}
const hideUploadPanel = () => {
    //eliminando panel de subida
    document.querySelector("#upload-button").removeAttribute("disabled")
    document.querySelector("#upload-section > div").innerHTML = "";
}