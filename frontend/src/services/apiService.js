import API from "../config/apiClient";

const API_URL = import.meta.env.VITE_BASEAPIURL;

class ApiService {
    constructor() {
        this.authSignup = this.authSignup.bind(this);
        this.authLogin = this.authLogin.bind(this);
        this.authLogout = this.authLogout.bind(this);
        this.authRefresh = this.authRefresh.bind(this);
        this.getUser = this.getUser.bind(this);
        this.fetchElements = this.fetchElements.bind(this);
        this.fetchElement = this.fetchElement.bind(this);
        this.fetchChildren = this.fetchChildren.bind(this);
        this.upsertElement = this.upsertElement.bind(this);
        this.createFromTemplate = this.createFromTemplate.bind(this);
        this.deleteElement = this.deleteElement.bind(this);
        this.createFile = this.createFile.bind(this);
    }

    async authSignup(data) { return await API.post('/auth/signup', data); }

    async authLogin(data) { return await API.post('/auth/login', data); }

    async authLogout() { return await API.post('/auth/logout'); }

    async authRefresh() { return await API.get('/auth/refresh'); }

    async getUser() { return await API.get('/user/'); }

    async fetchElements(kind, query) {
        if (query) return await API.get(`${kind}/?${query}`);
        else return await API.get(`${kind}/`);
    }
    
    async fetchElement(kind, id){ return await API.get(`${kind}/${id}`); }
    
    async fetchChildren(kind, id){ return await API.get(`${kind}/getchildren/${id}`); };
    
    async upsertElement(kind, element){ return await API.post(`${kind}/`, element); };
    
    // Can be used to create a new story, or add a child to an existing story
    async createFromTemplate(templateId, parentId){ return await API.post(`storynode/postfromtemplate/`, {templateId, parentId}); }
    
    async deleteElement(kind, id){ return await API.delete(`${kind}/${id}`); }
    
    async createFile(id){
        //TODO
        console.log('createFile', id);
    }

}

export default new ApiService();