import { useState, useEffect } from 'react';
import api from '../../api';

import { Link } from "react-router";

import './OrgList.css'

import { components } from '../../schema';
import Status from "../../status";

interface OrgRowProps {
    data: components["schemas"]["PublicOrg"]
}

function OrgRow(props: OrgRowProps) {
    return (
        <ul className="OrgRow Row" key={props.data.id}>
            <li>{props.data.name}</li>
            <li><Link to={`/orgs/${props.data.id}`}>muokkaa</Link></li>
        </ul >
    )
}

function OrgList() {
    const [status, setStatus] = useState(Status.Loading);
    const [errorMsg, setErrorMsg] = useState("");

    const [orgs, setOrgs] = useState<components["schemas"]["PublicOrg"][]>([]);

    const { data, error: getError, isLoading } = api.useQuery(
        "get", "/orgs/"
    );

    useEffect(() => {
        if (isLoading) {
            setStatus(Status.Loading);
        }

    }, [isLoading])

    useEffect(() => {
        if (data) {
            setStatus(Status.Success)
            setOrgs(data);
        }
    }, [data])

    useEffect(() => {
        if (getError) {
            setErrorMsg(getError.toString())
        }
    }, [getError])

    return (
        <div className={`OrgList status-${status}`}>
            <h3>Organisaatiot</h3>
            <div className="List">
                <ul className="Row header" key="header">
                    <li>Organisaatio</li>
                    <li>Muokkaa</li>
                </ul>
                {orgs.sort((a, b) => a.id - b.id).map((org) => (<OrgRow data={org} key={org.id} />))}
            </div>
            <div>
                <Link className="button" to="/orgs/new">Luo uusi organisaatio</Link>
            </div>
            <div className="error">
                {errorMsg}
            </div>
        </div>
    )
}

export default OrgList
