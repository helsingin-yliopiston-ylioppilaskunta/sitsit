import { useState, useEffect } from 'react';
import api from './../api';

import { Link } from "react-router";

import './UserList.css'

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

interface userRowProps {
    data: components["schemas"]["PublicUserWithOrg"]
}

function UserRow(props: userRowProps) {
    return (
        <ul className="UserRow Row" key={props.data.id}>
            <li>{props.data.id}</li>
            <li>{props.data.username}</li>
            <li>{props.data.org ? props.data.org.name : "unset"}</li>
            <li><Link to={`/users/${props.data.id}`}>edit</Link></li>
        </ul >
    )
}

function UserList() {
    const [status, setStatus] = useState(Status.Loading);
    const [errorMsg, setErrorMsg] = useState("");

    const [users, setUsers] = useState<components["schemas"]["PublicUserWithOrg"][]>([]);

    const { data, error: getError, isLoading } = api.useQuery(
        "get", "/users/"
    );

    useEffect(() => {
        if (isLoading) {
            setStatus(Status.Loading);
        }

    }, [isLoading])

    useEffect(() => {
        if (data) {
            setStatus(Status.Success)
            setUsers(data);
        }
    }, [data])

    useEffect(() => {
        if (getError) {
            setErrorMsg(getError.toString())
        }
    }, [getError])

    return (
        <div className={`UserList status-${statusToString(status)}`}>
            <h3>Users</h3>
            <div className="List">
                <ul className="Row header">
                    <li>#</li>
                    <li>username</li>
                    <li>organization</li>
                    <li>edit</li>
                </ul>
                {users.sort((a, b) => a.id - b.id).map((user) => (<UserRow data={user} />))}
            </div>
            <div>
                <Link className="button" to="/users/new">Create new user</Link>
            </div>
            <div className="error">
                {errorMsg}
            </div>
        </div>
    )
}

export default UserList
