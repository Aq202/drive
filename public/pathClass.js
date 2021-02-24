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

    static showPath(path, name) {

        PathClass.actualPath = {
            path: path + "/",
            name: name
        }

        let pathSectionItems = document.querySelectorAll("#explorer-section .path span:not(:first-child)")
        if (pathSectionItems) {
            pathSectionItems.forEach(item => item.remove())
        }

        let individualPath = "";

        for (name of path.split("/")) {
            if (name.trim() != "") {
                individualPath += `${name}/`;
                new PathClass(individualPath, name)
            }
        }
    }
}