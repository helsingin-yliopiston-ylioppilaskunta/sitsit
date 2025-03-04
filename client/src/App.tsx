import { useEffect, useState } from 'react';
import './App.css'

import User from "./components/User";

function App() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            const response = await fetch("http://localhost:8000/users/1");
            const data = await response.json();

            setUserData(data);
            setLoading(false);
        }

        fetchUser();
    }, [])

    if (loading) {
        return <div>Loading...</div>
    }
    else {
        return (
            <div className="App">
                <p>Moi</p>
                <input type="button" value="Hei!"></input>
                <User userData={userData.items[0]} />
            </div>
        )
    }
}

export default App
