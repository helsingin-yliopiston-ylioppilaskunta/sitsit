import { useState, useEffect } from 'react';
import api from './../api';

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

interface userRowProps {
    data: components["schemas"]["PublicUserWithOrg"]
}

function UserRow(props: userRowProps) {
    return (
        <ul className="UserRow Row" key={props.data.id}>
            <li>{props.data.id}</li>
            <li>{props.data.username}</li>
            <li>{props.data.org ? props.data.org.name : "unset"}</li>
            <li><a href={`/users/${props.data.id}`}>view / edit</a></li>
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
            setUsers(data.items);
            console.log(data);
        }
    }, [data])

    useEffect(() => {
        if (getError) {
            setErrorMsg(getError.toString())
        }
    }, [getError])

    return (
        <div className="UserList">
            <h3>Users</h3>
            <div>
                <p>Status: {statusToString(status)}</p>
                <p>Error: {errorMsg}</p>
            </div>
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
                <a href="/users/">Create new user</a>
            </div>
        </div>
    )
}

export default UserList
