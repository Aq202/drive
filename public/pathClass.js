class PathClass {

    static actualPath = ""

    constructor(path, name) {
        this.path = path;
        this.name = name;
        this.createPathElement()
        Archivo.setFilesList(this.path);
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
                PathClass.showPath(this.path)
                console.log(this.path)
            })
        }
    }

    static showPath(path) {

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