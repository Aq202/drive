document.addEventListener("DOMContentLoaded", e => {

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