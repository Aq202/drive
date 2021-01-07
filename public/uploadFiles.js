document.addEventListener("DOMContentLoaded", e => {


    document.getElementById("uploadForm").addEventListener("submit", function (e) {
        e.preventDefault();

        uploadFile(this);
        hideUploadPanel();
        document.querySelector("#upload-button").setAttribute("disabled", "disabled")
        document.getElementById("upload-section").style.display = "none";

    })

    document.querySelector("#upload-button > input").addEventListener("change", e => {

        hideLoadingPanel();

        //agregando lista de archivos seleccionados
        const fragment = document.createDocumentFragment();
        for (file of e.currentTarget.files) {
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
})


const uploadFile = form => {
    let request = new XMLHttpRequest();
    let loadingBar = document.createElement("DIV");

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
    })

    request.upload.addEventListener("loadend", e => {
        loadingBar.querySelector(".cancel-button").remove();
    })

    request.addEventListener("abort", e => {
        loadingBar.querySelector(".cancel-button").remove();
    })



    request.open('post', '/uploadFile');
    request.send(new FormData(form))
}

const hideLoadingPanel = () => {
    //Eliminando paneles de carga anteriores
    let panel = document.querySelectorAll(".loading-section");
    if (panel) panel.forEach(panel => panel.remove());
}
const hideUploadPanel = () => {
    //eliminando panel de subida
    document.querySelector("#upload-button > input").value = "";
    document.querySelector("#upload-button").removeAttribute("disabled")
    document.querySelector("#upload-section > div").innerHTML = "";
}