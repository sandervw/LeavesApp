const API_URL = import.meta.env.VITE_BASEAPIURL;

class ApiService {
    constructor() {
        this.fetchElements = this.fetchElements.bind(this);
        this.fetchElement = this.fetchElement.bind(this);
        this.fetchChildren = this.fetchChildren.bind(this);
        this.upsertElement = this.upsertElement.bind(this);
        this.createFromTemplate = this.createFromTemplate.bind(this);
        this.deleteElement = this.deleteElement.bind(this);
        this.createFile = this.createFile.bind(this);
        this.signupUser = this.signupUser.bind(this);
        this.loginUser = this.loginUser.bind(this);
    }

    async fetchElements(kind, query, options){
        try {
            let elements;
            if (query) elements = await fetch(`${API_URL}${kind}/?${query}`, options);
            else elements = await fetch(`${API_URL}${kind}/`, options);
            return elements.json();
        } catch (err) {
            console.log(err);
            return err;
        }
    };
    
    async fetchElement(kind, id, options){
        try {
            const element = await fetch(`${API_URL}${kind}/${id}`, options);
            return element.json();
        } catch (err) {
            console.log(err);
            return err;
        }
    }
    
    async fetchChildren(kind, id, options){
        try {
            const elements = await fetch(`${API_URL}${kind}/getchildren/${id}`, options);
            return elements.json();
        } catch (err) {
            console.log(err);
            return err;
        }
    };
    
    async upsertElement(kind, element, options){
        try {
            const result = await fetch(`${API_URL}${kind}/`, {
                method: 'POST',
                body: JSON.stringify(element),
                ...options
            });
            return result.json();
        } catch (err) {
            console.log(err);
            return err;
        }
    };
    
    // Can be used to create a new story, or add a child to an existing story
    async createFromTemplate(templateId, parentId, options){
        try {
            const result = await fetch(`${API_URL}storynode/postfromtemplate/`, {
                method: 'POST',
                body: parentId ?
                    JSON.stringify({templateId, parentId})
                    : JSON.stringify({templateId}),
                ...options
            });
            return result.json();
        } catch (err) {
            console.log(err);
            return err;
        }
    }
    
    async deleteElement(kind, id, options){
        try {
            const result = await fetch(`${API_URL}${kind}/${id}`, {method: 'DELETE', ...options});
            return result.json();
        } catch (err) {
            console.log(err);
            return err;
        }
    }
    
    async createFile(id, options){
        try {
            const result = await fetch(`${API_URL}storynode/posttofile/`, {
                method: 'POST',
                body: JSON.stringify({id}),
                ...options
            });
            return result.json();
        } catch (err) {
            console.log(err);
            return err;
        }
    }
    
    async signupUser(email, username, password){
        try {
            const result = await fetch(`${API_URL}auth/signup`, {
                method: 'POST',
                credentials: 'include',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, username, password})
            });
            return result;
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    async refreshToken(){
        try {
            const result = await fetch(`${API_URL}auth/refresh`, {
                method: 'GET',
                credentials: 'include',
                headers: {'Content-Type': 'application/json'},
            });
            return result;
        } catch (err) {
            console.log(err);
            return err;
        }
    }
    
    async loginUser(email, password){
        try {
            // TODO: Fix for either email or username
            const result = await fetch(`${API_URL}auth/login`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, password})
            });
            return result;
        } catch (err) {
            console.log(err);
            return err;
        }
    }

}

export default new ApiService();