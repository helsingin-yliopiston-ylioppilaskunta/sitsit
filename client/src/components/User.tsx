import { useState } from 'react';
import './User.css'

function User(props) {
    const [username, setUsername] = useState(props.userData.username);

    function saveUser() {
        const user = {
            username: username,
            hash: "xxx",
            org_id: 1
        };

        async function uploadUser() {
            const response = await fetch(`http://localhost:8000/users/${props.userData.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });
            const data = await response.json();

            console.log(data)
        }

        uploadUser();
    }


    return (
        <div className="User">
            <form onSubmit={(e) => {
                e.preventDefault();
                saveUser();
            }}>
                <div className="row">
                    <label>Id</label>
                    <input type="number" disabled="disabled" value={props.userData.id} />
                </div>
                <div>
                    <label>Username</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div>
                    <input type="submit" value="Tallenna" />
                </div>
            </form>
        </div>
    )
}

export default User
