class PathClass {

    static actualPath = null;

    constructor(path, name, loadFiles) {
        this.path = path;
        this.name = name;
        this.createPathElement()

        if (loadFiles !== false) {
            Archivo.setFilesList(this.path);
        }
    }

    createPathElement() {
        let pathSection = document.querySelector("#explorer-section .path")
        if (pathSection) {
            let newElement = document.createElement("span")
            newElement.innerText = ` ${this.name} /`;
            pathSection.appendChild(newElement)
            this.addEvents(newElement)
        }
    }

    addEvents(obj) {
        if (obj !== undefined) {
            obj.addEventListener("click", e => {
                Archivo.setFilesList(this.path);
                PathClass.showPath(this.path, this.name)
            })
        }
    }

    static showPath(path) {

        PathClass.actualPath = path + "/"
        PathClass.actualPath = PathClass.actualPath.replaceAll("//", "/")

        let pathSectionItems = document.querySelectorAll("#explorer-section .path span:not(:first-child)")
        if (pathSectionItems) {
            pathSectionItems.forEach(item => item.remove())
        }

        let individualPath = "";
        let pathModules = path.replaceAll("//", "/").split("/").filter(item => item != "")

        for (let cont in pathModules) {
            let name = pathModules[cont]
            if (name.trim() != "") {
                individualPath += `${name}/`;

                if (cont == pathModules.length - 1) {
                    new PathClass(individualPath, name)
                } else {
                    new PathClass(individualPath, name, false)
                }

            }
        }
    }
}