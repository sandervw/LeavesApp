const abortCont = new AbortController();

const fetchElements = async (kind, query) => {
    try {
        let elements;
        if (query) elements = await fetch(`http://localhost:8080/${kind}/?${query}`, {signal: abortCont.signal});
        else elements = await fetch(`http://localhost:8080/${kind}/`, {signal: abortCont.signal});
        return elements.json();
    } catch (err) {
        console.log(err);
        return err;
    }
};

const fetchElement = async (kind, id) => {
    try {
        const element = await fetch(`http://localhost:8080/${kind}/${id}`, {signal: abortCont.signal});
        return element.json();
    } catch (err) {
        console.log(err);
        return err;
    }
}

const fetchChildren = async (kind, id) => {
    try {
        const elements = await fetch(`http://localhost:8080/${kind}/getchildren/${id}`, {signal: abortCont.signal});
        return elements.json();
    } catch (err) {
        console.log(err);
        return err;
    }
};

const upsertElement = async (kind, element) => {
    try {
        const result = await fetch(`http://localhost:8080/${kind}/`, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(element)
        });
        return result.json();
    } catch (err) {
        console.log(err);
        return err;
    }
};

// Can be used to create a new story, or add a child to an existing story
const createFromTemplate = async (templateId, parentId) => {
    try {
        const result = await fetch('http://localhost:8080/storynodes/postfromtemplate/', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: parentId ?
                JSON.stringify({templateId, parentId})
                : JSON.stringify({templateId})
        });
        return result.json();
    } catch (err) {
        console.log(err);
        return err;
    }
}

const deleteElement = async (kind, id) => {
    try {
        const result = await fetch(`http://localhost:8080/${kind}/${id}`, {method: 'DELETE'});
        return result.json();
    } catch (err) {
        console.log(err);
        return err;
    }
}

const createFile = async (id) => {
    try {
        const result = await fetch('http://localhost:8080/storynodes/posttofile/', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id})
        });
        return result.json();
    } catch (err) {
        console.log(err);
        return err;
    }
}

const signupUser = async (email, username, password) => {
    try {
        const result = await fetch('http://localhost:8080/users/signup', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, username, password})
        });
        return result;
    } catch (err) {
        console.log(err);
        return err;
    }
}

const loginUser = async (username, password) => {
    try {
        const result = await fetch('http://localhost:8080/users/login', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, password})
        });
        return result;
    } catch (err) {
        console.log(err);
        return err;
    }
}

export {
    fetchElements,
    fetchElement,
    fetchChildren,
    upsertElement,
    createFromTemplate,
    deleteElement,
    createFile,
    signupUser,
    loginUser
}