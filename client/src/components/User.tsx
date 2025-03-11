import { useState, useEffect } from 'react';
import api from './../api';

import './User.css'

import { components } from './../schema';

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

interface userProps {
    userId?: number;
}

function User(props: userProps) {
    const [status, setStatus] = useState(Status.Loading);
    const [errorMsg, setErrorMsg] = useState("");
    const [modified, setModified] = useState(false);

    const [username, setUsername] = useState("");

    const { data, error: getError, isLoading } = (props.userId) ? api.useQuery(
        "get", "/users/{user_id}", {
        params: {
            path: { user_id: props.userId || -1 }
        },
    }
    ) : { data: undefined, error: undefined, isLoading: false };

    const { mutate: updateUser, isPending: updating } =
        api.useMutation(
            "patch", "/users/{user_id}", {
            params: {
                path: { user_id: props.userId }
            },
            onSuccess: () => {
                setModified(false);
            },
            onError: (error: { detail?: components["schemas"]["ValidationError"][] }) => {
                setStatus(Status.Error)
                setErrorMsg(error.toString())
            }
        }
        );

    const { mutate: createUser, isPending: creating } =
        api.useMutation(
            "post", "/users/", {
            onSuccess: () => {
                setModified(false);
            },
            onError: (error: { detail?: components["schemas"]["ValidationError"][] }) => {
                setStatus(Status.Error)
                setErrorMsg(error.toString())
            }
        }
        );

    const handleUpdateUser = () => {
        const user = {
            username: username,
            hash: "xxx",
            org_id: 1,
        };

        if (props.userId) {
            updateUser({
                params: {
                    path: { user_id: props.userId || -1 }
                },
                body: user
            });
        } else {
            createUser({
                body: user
            })
        }
    };

    useEffect(() => {
        if (isLoading) {
            setStatus(Status.Loading);
        }

    }, [isLoading])

    useEffect(() => {
        if (creating) {
            setStatus(Status.Loading);
        }

    }, [creating])

    useEffect(() => {
        if (data) {
            setStatus(Status.Success)
            const user = data.items[0];
            setUsername(user.username || "");
        }
    }, [data])

    useEffect(() => {
        if (getError) {
            setErrorMsg(getError.toString())
        }
    }, [getError])

    useEffect(() => {
        console.log(typeof errorMsg, errorMsg);
    }, [errorMsg])

    useEffect(() => {
        console.log("Status:", status)
    }, [status])

    return (
        <div className="User">
            <h3>{props.userId ? "Modify" : "New"} user</h3>
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
                    <input type="number" disabled={true} value={props.userId} />
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
