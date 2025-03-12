import { useState, useEffect } from 'react';
import api from '../../api';

import { Link } from "react-router";

import './UserList.css'

import { components } from '../../schema';
import Status from "../../status";

interface UserRowProps {
    data: components["schemas"]["PublicUserWithOrg"]
}

function UserRow(props: UserRowProps) {
    return (
        <ul className="UserRow Row" key={props.data.id}>
            <li>{props.data.username}</li>
            <li>{props.data.org ? props.data.org.name : "unset"}</li>
            <li><Link to={`/users/${props.data.id}`}>muokkaa</Link></li>
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
        <div className={`UserList status-${status}`}>
            <h3>Käyttäjät</h3>
            <div className="List">
                <ul className="Row header" key="header">
                    <li>Käyttäjä</li>
                    <li>Organisaatio</li>
                    <li>Muokkaa</li>
                </ul>
                {users.sort((a, b) => a.id - b.id).map((user) => (<UserRow data={user} key={user.id} />))}
            </div>
            <div>
                <Link className="button" to="/users/new">Luo uusi käyttäjä</Link>
            </div>
            <div className="error">
                {errorMsg}
            </div>
        </div>
    )
}

export default UserList
