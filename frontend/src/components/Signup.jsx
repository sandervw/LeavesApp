import { useState } from "react";

const Signup = ({ hideModal }) => {

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {

        e.preventDefault();
        // Handle signup logic here
        console.log({ email, username, password });
        hideModal();
        // Add the new storynode
        // const data = await upsertElement('storynodes', newStorynode);
        // if(parent) updateParent(data._id);
        // dispatch({type: 'CREATE_STORYNODE', payload: data})
        // setNewCreate({name: "", text: ""});
    };

    return (
        <div className="signup-form">
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>Signup</h2>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(e);
                    }}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button className="text-button" type="submit">Signup</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;