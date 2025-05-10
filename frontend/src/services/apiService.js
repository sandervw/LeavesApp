import API from "../config/apiClient";

const API_URL = import.meta.env.VITE_BASEAPIURL;

class ApiService {
    constructor() {
        this.authSignup = this.authSignup.bind(this);
        this.authLogin = this.authLogin.bind(this);
        this.authLogout = this.authLogout.bind(this);
        this.authRefresh = this.authRefresh.bind(this);
        this.getUser = this.getUser.bind(this);
        this.verifyEmail = this.verifyEmail.bind(this);
        this.forgotPassword = this.forgotPassword.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.fetchElements = this.fetchElements.bind(this);
        this.fetchElement = this.fetchElement.bind(this);
        this.fetchChildren = this.fetchChildren.bind(this);
        this.upsertElement = this.upsertElement.bind(this);
        this.createFromTemplate = this.createFromTemplate.bind(this);
        this.deleteElement = this.deleteElement.bind(this);
        this.createFile = this.createFile.bind(this);
    }

    async authSignup(data) { return API.post('/auth/signup', data); }

    async authLogin(data) { return API.post('/auth/login', data); }

    async authLogout() { return API.get('/auth/logout'); }

    async authRefresh() { return API.get('/auth/refresh'); }

    async getUser() { return API.get('/user'); }

    async verifyEmail(verificationCode) { return API.get(`/auth/email/verify/${verificationCode}`); }

    async forgotPassword(email) { return API.post('/auth/password/forgot', { email }); }

    async resetPassword({ verificationCode, password }) { return API.post('/auth/password/reset', { verificationCode, password }); }

    async fetchElements(kind, query) {
        if (query) return API.get(`${kind}/?${query}`);
        else return API.get(`${kind}/`);
    }
    
    async fetchElement(kind, id){ return API.get(`${kind}/${id}`); }
    
    async fetchChildren(kind, id){ return API.get(`${kind}/getchildren/${id}`); };
    
    async upsertElement(kind, element){ return API.post(`${kind}/`, element); };
    
    // Can be used to create a new story, or add a child to an existing story
    async createFromTemplate(templateId, parentId){ return API.post(`storynode/postfromtemplate/`, {templateId, parentId}); }
    
    async deleteElement(kind, id){ return API.delete(`${kind}/${id}`); }
    
    async createFile(id){
        //TODO
        console.log('createFile', id);
    }

}

export default new ApiService();