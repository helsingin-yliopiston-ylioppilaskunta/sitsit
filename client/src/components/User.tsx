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
            str = "loading";
            break;
        case Status.Success:
            str = "ok"
            break;
        case Status.Error:
            str = "error"
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
    const [organization, setOrganization] = useState("");

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
                setStatus(Status.Success)
            },
            onError: (error: { detail?: components["schemas"]["ValidationError"][] }) => {
                setStatus(Status.Error)
                setErrorMsg(`${error.detail}`)
            }
        }
        );

    const { mutate: createUser, isPending: creating } =
        api.useMutation(
            "post", "/users/", {
            onSuccess: () => {
                setModified(false);
                setStatus(Status.Success)
            },
            onError: (error: { detail?: components["schemas"]["ValidationError"][] }) => {
                setStatus(Status.Error)
                setErrorMsg(`${error.detail}`)
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
        if (updating) {
            setStatus(Status.Loading);
        }
    }, [updating])

    useEffect(() => {
        if (data) {
            setStatus(Status.Success)
            const user = data;
            setUsername(user.username || "");
            setOrganization(user.org ? user.org.name : "");
        }
    }, [data])

    useEffect(() => {
        if (getError) {
            setErrorMsg(getError.toString())
        }
    }, [getError])

    return (
        <div className={`User status-${statusToString(status)}`}>
            <h3>{props.userId ? "Modify" : "New"} user</h3>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateUser();
            }}>
                <div className="row">
                    <input type="hidden" disabled={true} value={props.userId} />
                </div>
                <div className="row">
                    <label>Username</label>
                    <input type="text" value={username} onChange={(e) => {
                        setUsername(e.target.value);
                        setModified(true);
                    }} />
                </div>
                <div className="row">
                    <label>Organization</label>
                    <input type="text" disabled={true} value={organization} />
                </div>
                <div className="row">
                    <input type="submit" disabled={!modified} value="Tallenna" />
                </div>
            </form>
            <div className="error">
                {errorMsg}
            </div>
        </div>
    )
}

export default User
