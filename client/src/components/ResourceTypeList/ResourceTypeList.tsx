import { useState, useEffect } from 'react';
import api from '../../api';

import { Link } from "react-router";

import './ResourceTypeList.css'

import { components } from '../../schema';
import Status from "../../status";

interface ResourceTypeRowProps {
    data: components["schemas"]["PublicResourceType"]
}

function ResourceTypeRow(props: ResourceTypeRowProps) {
    return (
        <ul className="ResourceTypeRow Row" key={props.data.id}>
            <li>{props.data.name}</li>
            <li><Link to={`/resources/${props.data.id}`}>muokkaa</Link></li>
        </ul >
    )
}

function ResourceTypeList() {
    const [status, setStatus] = useState(Status.Loading);
    const [errorMsg, setErrorMsg] = useState("");

    const [resources, setResourceTypes] = useState<components["schemas"]["PublicResourceType"][]>([]);

    const { data, error: getError, isLoading } = api.useQuery(
        "get", "/resources/"
    );

    useEffect(() => {
        if (isLoading) {
            setStatus(Status.Loading);
        }

    }, [isLoading])

    useEffect(() => {
        if (data) {
            setStatus(Status.Success)
            setResourceTypes(data);
        }
    }, [data])

    useEffect(() => {
        if (getError) {
            setErrorMsg(getError.toString())
        }
    }, [getError])

    return (
        <div className={`ResourceTypeList status-${status}`}>
            <h3>Resurssityypit</h3>
            <div className="List">
                <ul className="Row header" key="header">
                    <li>Resurssityyppi</li>
                    <li>Muokkaa</li>
                </ul>
                {resources.sort((a, b) => a.id - b.id).map((resource) => (<ResourceTypeRow data={resource} key={resource.id} />))}
            </div>
            <div>
                <Link className="button" to="/resources/new">Luo uusi resurssityyppi</Link>
            </div>
            <div className="error">
                {errorMsg}
            </div>
        </div>
    )
}

export default ResourceTypeList
