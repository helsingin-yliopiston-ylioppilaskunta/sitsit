import { useEffect, useState } from 'react';
import './App.css'

import User from "./components/User";
import { fetch_user } from "./api";

function App() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            const user = await fetch_user(1);
            setUserData(user);
            setLoading(false);
        }

        loadUser()
    }, [])

    if (loading) {
        return <div>Loading...</div>
    }
    else {
        return (
            <div className="App">
                <p>Moi</p>
                <input type="button" value="Hei!"></input>
                <User userData={userData} />
            </div>
        )
    }
}

export default App
