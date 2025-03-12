import { useState, useEffect } from 'react';
import api from '../../api';

import './User.css'

import { components } from '../../schema';

import { Link, useNavigate } from "react-router";
import Status from "../../status";

interface UserProps {
    userId?: number;
}

function User(props: UserProps) {
    const [status, setStatus] = useState(Status.Loading);
    const [errorMsg, setErrorMsg] = useState("");
    const [modified, setModified] = useState(false);

    const [username, setUsername] = useState("");
    const [organization, setOrganization] = useState(1);

    const [orgs, setOrgs] = useState<components["schemas"]["PublicOrg"][]>([]);

    const navigate = useNavigate();

    const { data, error: getError, isLoading } = api.useQuery(
        "get", "/users/{user_id}", {
        params: {
            path: { user_id: props.userId || -1 }
        },
        enabled: !!props.userId
    });

    const { data: orgResponse, error: orgError, isLoading: orgLoading } = api.useQuery(
        "get", "/orgs/"
    );

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
                setStatus(Status.Success);
                navigate("/users/");
            },
            onError: (error: { detail?: components["schemas"]["ValidationError"][] }) => {
                setStatus(Status.Error)
                setErrorMsg(`${error.detail}`)
            }
        }
        );

    const { mutate: deleteUser, isPending: deleting } =
        api.useMutation(
            "delete", "/users/{user_id}", {
            params: {
                path: { user_id: props.userId }
            },
            onSuccess: () => {
                setModified(false);
                setStatus(Status.Success);
                navigate("/users/");
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
            org_id: organization,
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

    const removeUser = () => {
        deleteUser({ params: { path: { user_id: props.userId || -1 } } })
    }

    const isAnyLoading = isLoading || orgLoading || creating || updating || deleting;

    const combinedError = getError || orgError;

    useEffect(() => {
        if (isAnyLoading) {
            setStatus(Status.Loading);
        } else if (combinedError) {
            setStatus(Status.Error);
            setErrorMsg(combinedError.toString());
        } else if (data) {
            setStatus(Status.Success);
        }
    }, [isAnyLoading, combinedError, data]);

    useEffect(() => {
        if (data) {
            setUsername(data.username || "")
            setOrganization(data.org ? data.org.id : 1);
        }
    }, [data])

    useEffect(() => {
        if (orgResponse) {
            setOrgs(orgResponse);
        }
    }, [orgResponse]);

    return (
        <div className={`User status-${status}`}>
            <h3>{props.userId ? "Muokkaa käyttäjää" : "Uusi käyttäjä"}</h3>
            <Link to="/users/">Palaa</Link>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateUser();
            }}>
                <div className="row">
                    <input type="hidden" disabled={true} value={props.userId} />
                </div>
                <div className="row">
                    <label>Käyttäjänimi</label>
                    <input type="text" value={username} onChange={(e) => {
                        setUsername(e.target.value);
                        setModified(true);
                    }} />
                </div>
                <div className="row">
                    <label>Organisaatio</label>
                    <select name="organization" id="organization"
                        value={organization}
                        onChange={(e) => {
                            setOrganization(parseInt(e.target.value));
                            setModified(true);
                        }}
                    >
                        {orgs?.map((org) => (
                            <option value={org.id} key={org.id} >{org.name}</option>
                        ))}
                    </select>
                </div>
                <div className="row">
                    <input type="submit" disabled={!modified} value="Tallenna" />
                    <input type="button" value="Poista käyttäjä"
                        onClick={(e) => {
                            e.preventDefault();
                            removeUser();
                        }}
                    />
                </div>
            </form>
            <div className="error">
                {errorMsg}
            </div>
        </div>
    )
}

export default User
