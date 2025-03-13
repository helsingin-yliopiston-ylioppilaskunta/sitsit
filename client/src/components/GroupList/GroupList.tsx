import { useState, useEffect } from 'react';
import api from '../../api';

import { Link } from "react-router";

import './GroupList.css'

import { components } from '../../schema';
import Status from "../../status";

interface GroupRowProps {
    data: components["schemas"]["PublicGroupWithCollectionAndResources"]
}

function GroupRow(props: GroupRowProps) {
    return (
        <ul className="GroupRow Row" key={props.data.id}>
            <li>{props.data.name}</li>
            <li>{props.data.collection ? props.data.collection.name : "unset"}</li>
            <li><Link to={`/groups/${props.data.id}`}>muokkaa</Link></li>
        </ul >
    )
}

function GroupList() {
    const [status, setStatus] = useState(Status.Loading);
    const [errorMsg, setErrorMsg] = useState("");

    const [groups, setGroups] = useState<components["schemas"]["PublicGroupWithCollectionAndResources"][]>([]);

    const { data, error: getError, isLoading } = api.useQuery(
        "get", "/groups/"
    );

    useEffect(() => {
        if (isLoading) {
            setStatus(Status.Loading);
        }

    }, [isLoading])

    useEffect(() => {
        if (data) {
            setStatus(Status.Success)
            setGroups(data);
        }
    }, [data])

    useEffect(() => {
        if (getError) {
            setErrorMsg(getError.toString())
        }
    }, [getError])

    return (
        <div className={`GroupList status-${status}`}>
            <h3>Ryhmät</h3>
            <div className="List">
                <ul className="Row header" key="header">
                    <li>Ryhmä</li>
                    <li>Kokoelma</li>
                    <li>Muokkaa</li>
                </ul>
                {groups.sort((a, b) => a.id - b.id).map((group) => (<GroupRow data={group} key={group.id} />))}
            </div>
            <div>
                <Link className="button" to="/groups/new">Luo uusi ryhmä</Link>
            </div>
            <div className="error">
                {errorMsg}
            </div>
        </div>
    )
}

export default GroupList
