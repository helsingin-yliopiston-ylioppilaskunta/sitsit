import { useState, useEffect } from 'react';
import api from '../../api';

import { Link } from "react-router";

import './ResourceList.css'

import { components } from '../../schema';
import Status from "../../status";

interface ResourceRowProps {
    data: components["schemas"]["PublicResourceWithGroupAndResourceType"]
}

function ResourceRow(props: ResourceRowProps) {
    return (
        <ul className="ResourceRow Row" key={props.data.id}>
            <li>{props.data.name}</li>
            <li>{props.data.group ? props.data.group.name : "unset"}</li>
            <li>{props.data.resource_type ? props.data.resource_type.name : "unset"}</li>
            <li><Link to={`/resources/${props.data.id}`}>muokkaa</Link></li>
        </ul >
    )
}

function ResourceList() {
    const [status, setStatus] = useState(Status.Loading);
    const [errorMsg, setErrorMsg] = useState("");

    const [resources, setResources] = useState<components["schemas"]["PublicResourceWithGroupAndResourceType"][]>([]);

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
            setResources(data);
        }
    }, [data])

    useEffect(() => {
        if (getError) {
            setErrorMsg(getError.toString())
        }
    }, [getError])

    return (
        <div className={`ResourceList status-${status}`}>
            <h3>Resurssit</h3>
            <div className="List">
                <ul className="Row header" key="header">
                    <li>Resurssi</li>
                    <li>Ryhmä</li>
                    <li>Resurssin tyyppi</li>
                    <li>Muokkaa</li>
                </ul>
                {resources.sort((a, b) => a.id - b.id).map((resource) => (<ResourceRow data={resource} key={resource.id} />))}
            </div>
            <div>
                <Link className="button" to="/resources/new">Luo uusi resurssi</Link>
            </div>
            <div className="error">
                {errorMsg}
            </div>
        </div>
    )
}

export default ResourceList
