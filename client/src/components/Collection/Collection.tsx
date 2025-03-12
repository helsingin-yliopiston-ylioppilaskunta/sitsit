import { useState, useEffect } from 'react';
import api from '../../api';

import './Collection.css'

import { components } from '../../schema';

import { Link, useNavigate } from "react-router";
import Status from "../../status";

interface CollectionProps {
    collectionId?: number;
}

function Collection(props: CollectionProps) {
    const [status, setStatus] = useState(Status.Loading);
    const [errorMsg, setErrorMsg] = useState("");
    const [modified, setModified] = useState(false);

    const [name, setName] = useState("");

    const navigate = useNavigate();

    const { data, error: getError, isLoading } = props.collectionId
        ? api.useQuery(
            "get", "/collections/{collection_id}", {
            params: {
                path: { collection_id: props.collectionId || -1 }
            },
        }) : { data: undefined, error: undefined, isLoading: false };

    const { mutate: updateCollection, isPending: updating } =
        api.useMutation(
            "patch", "/collections/{collection_id}", {
            params: {
                path: { collection_id: props.collectionId }
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

    const { mutate: createCollection, isPending: creating } =
        api.useMutation(
            "post", "/collections/", {
            onSuccess: () => {
                setModified(false);
                setStatus(Status.Success);
                navigate("/collections/");
            },
            onError: (error: { detail?: components["schemas"]["ValidationError"][] }) => {
                setStatus(Status.Error)
                setErrorMsg(`${error.detail}`)
            }
        }
        );

    const { mutate: deleteCollection, isPending: deleting } =
        api.useMutation(
            "delete", "/collections/{collection_id}", {
            params: {
                path: { collection_id: props.collectionId }
            },
            onSuccess: () => {
                setModified(false);
                setStatus(Status.Success);
                navigate("/collections/");
            },
            onError: (error: { detail?: components["schemas"]["ValidationError"][] }) => {
                setStatus(Status.Error)
                setErrorMsg(`${error.detail}`)
            }
        }
        );

    const handleUpdateCollection = () => {
        const collection = {
            name: name,
        };

        if (props.collectionId) {
            updateCollection({
                params: {
                    path: { collection_id: props.collectionId || -1 }
                },
                body: collection
            });
        } else {
            createCollection({
                body: collection
            })
        }
    };

    const removeOrg = () => {
        deleteCollection({ params: { path: { collection_id: props.collectionId || -1 } } })
    }

    const isAnyLoading = isLoading || creating || updating || deleting;

    const combinedError = getError;

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
            setName(data.name || "")
        }
    }, [data])

    return (
        <div className={`Collection status-${status}`}>
            <h3>{props.collectionId ? "Muokkaa kokoelmaa" : "Uusi kokoelma"}</h3>
            <Link to="/collections/">Palaa</Link>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateCollection();
            }}>
                <div className="row">
                    <input type="hidden" disabled={true} value={props.collectionId} />
                </div>
                <div className="row">
                    <label>Nimi</label>
                    <input type="text" value={name} onChange={(e) => {
                        setName(e.target.value);
                        setModified(true);
                    }} />
                </div>
                <div className="row">
                    <input type="submit" disabled={!modified} value="Tallenna" />
                    <input type="button" value="Poista kokoelma"
                        onClick={(e) => {
                            e.preventDefault();
                            removeOrg();
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

export default Collection
