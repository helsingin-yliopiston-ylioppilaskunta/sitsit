import { useState, useEffect } from 'react';
import api from './../api';

import './User.css'

enum Status {
    Loading,
    Success,
    Error
}

function statusToString(status: Status) {
    let str = ""
    switch (status) {
        case Status.Loading:
            str = "Loading";
            break;
        case Status.Success:
            str = "Ok"
            break;
        case Status.Error:
            str = "Error"
            break;
    }

    return str
}

function User(props) {
    const [status, setStatus] = useState(Status.Loading);
    const [errorMsg, setErrorMsg] = useState("");
    const [modified, setModified] = useState(false);

    const [username, setUsername] = useState("");

    const { data, error: getError, isLoading } = api.useQuery(
        "get", "/users/{user_id}", {
            params: {
                path: { user_id: props.userId }
            },
        }
    );

    const { mutate: updateUser, error: updateError, isPending: updating } = api.useMutation(
        "patch", "/users/{user_id}", {
            params: {
                path: { user_id: props.userId }
            },
            onSuccess: (data) => {
                console.log("Modify successfull:", data)
                setModified(false);
            },
            onError: (error) => {
                console.error("Failed:", error)
                setStatus(Status.Error)
                setErrorMsg(error)
            }
        }
    );

    const handleUpdateUser = () => {
        const user = {
            username: username,
            hash: "xxx",
            org_id: 1,
        };

        updateUser({
            params: {
                path: { user_id: props.userId }
            },
            body: user
        });
    };

    useEffect(() => {
        if (isLoading) {
            setStatus(Status.Loading);
        }

    }, [isLoading])

    useEffect(() => {
        if (data) {
            setStatus(Status.Success)
            const user = data.items[0];
            setUsername(user.username);
        }
    }, [data])

    useEffect(() => {
        setErrorMsg(getError) 
    }, [getError])

    useEffect(() => {
        setErrorMsg(updateError) 
    }, [updateError])

    useEffect(() => {
        console.log("Status:", status)
    }, [status])

    return (
        <div className="User">
            <h3>User</h3>
            <div>
                <p>Status: {statusToString(status)}</p>
                <p>Updating: {updating ? "yes" : "no"}</p>
                <p>Modified: {modified ? "modified" : "changes saved"}</p>
                <p>Error: {errorMsg}</p>
            </div>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateUser();
            }}>
                <div className="row">
                    <label>Id</label>
                    <input type="number" disabled="disabled" value={props.userId} />
                </div>
                <div>
                    <label>Username</label>
                    <input type="text" value={username} onChange={(e) => {
                        setUsername(e.target.value);
                        setModified(true);
                    }} />
                </div>
                <div>
                    <input type="submit" value="Tallenna" />
                </div>
            </form>
        </div>
    )
}

export default User
