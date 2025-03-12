import { useState, useEffect } from 'react';
import api from '../../api';

import { Link } from "react-router";

import './CollectionList.css'

import { components } from '../../schema';
import Status from "../../status";

interface CollectionRowProps {
    data: components["schemas"]["PublicCollection"]
}

function CollectionRow(props: CollectionRowProps) {
    return (
        <ul className="CollectionRow Row" key={props.data.id}>
            <li>{props.data.name}</li>
            <li><Link to={`/collections/${props.data.id}`}>muokkaa</Link></li>
        </ul >
    )
}

function CollectionList() {
    const [status, setStatus] = useState(Status.Loading);
    const [errorMsg, setErrorMsg] = useState("");

    const [collections, setCollections] = useState<components["schemas"]["PublicCollection"][]>([]);

    const { data, error: getError, isLoading } = api.useQuery(
        "get", "/collections/"
    );

    useEffect(() => {
        if (isLoading) {
            setStatus(Status.Loading);
        }

    }, [isLoading])

    useEffect(() => {
        if (data) {
            setStatus(Status.Success)
            setCollections(data);
        }
    }, [data])

    useEffect(() => {
        if (getError) {
            setErrorMsg(getError.toString())
        }
    }, [getError])

    return (
        <div className={`CollectionList status-${status}`}>
            <h3>Kokoelmat</h3>
            <div className="List">
                <ul className="Row header" key="header">
                    <li>Kokoelma</li>
                    <li>Muokkaa</li>
                </ul>
                {collections.sort((a, b) => a.id - b.id).map((collection) => (<CollectionRow data={collection} key={collection.id} />))}
            </div>
            <div>
                <Link className="button" to="/collections/new">Luo uusi kokoelma</Link>
            </div>
            <div className="error">
                {errorMsg}
            </div>
        </div>
    )
}

export default CollectionList
