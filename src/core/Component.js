/**
*Base Component class
All entity components should extend this
*/

export class Component {
    
    constructor(type) {
        this.type = type;
        this.entity = null;
    }

    onAttach() {}
    onDetach() {}
    update(deltaTime) {}
}