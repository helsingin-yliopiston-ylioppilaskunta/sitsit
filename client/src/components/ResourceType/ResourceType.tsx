import { useState, useEffect } from 'react';
import api from '../../api';

import './ResourceType.css'

import { components } from '../../schema';

import { Link, useNavigate } from "react-router";
import Status from "../../status";

interface ResourceTypeProps {
    resourceId?: number;
}

function ResourceType(props: ResourceTypeProps) {
    const [status, setStatus] = useState(Status.Loading);
    const [errorMsg, setErrorMsg] = useState("");
    const [modified, setModified] = useState(false);

    const [name, setName] = useState("");

    const navigate = useNavigate();

    const { data, error: getError, isLoading } = props.resourceId
        ? api.useQuery(
            "get", "/resources/{resource_id}", {
            params: {
                path: { resource_id: props.resourceId! }
            },
        })
        : { data: undefined, error: undefined, isLoading: false };

    const { mutate: updateResourceType, isPending: updating } =
        api.useMutation(
            "patch", "/resources/{resource_id}", {
            params: {
                path: { resource_id: props.resourceId }
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

    const { mutate: createResourceType, isPending: creating } =
        api.useMutation(
            "post", "/resources/", {
            onSuccess: () => {
                setModified(false);
                setStatus(Status.Success);
                navigate("/resourcetypes/");
            },
            onError: (error: { detail?: components["schemas"]["ValidationError"][] }) => {
                setStatus(Status.Error)
                setErrorMsg(`${error.detail}`)
            }
        }
        );

    const { mutate: deleteResourceType, isPending: deleting } =
        api.useMutation(
            "delete", "/resources/{resource_id}", {
            params: {
                path: { resource_id: props.resourceId }
            },
            onSuccess: () => {
                setModified(false);
                setStatus(Status.Success);
                navigate("/resourcetypes/");
            },
            onError: (error: { detail?: components["schemas"]["ValidationError"][] }) => {
                setStatus(Status.Error)
                setErrorMsg(`${error.detail}`)
            }
        }
        );

    const handleUpdateResourceType = () => {
        const resource = {
            name: name,
        };

        if (props.resourceId) {
            updateResourceType({
                params: {
                    path: { resource_id: props.resourceId || -1 }
                },
                body: resource
            });
        } else {
            createResourceType({
                body: resource
            })
        }
    };

    const removeResourceType = () => {
        deleteResourceType({ params: { path: { resource_id: props.resourceId || -1 } } })
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
        <div className={`ResourceType status-${status}`}>
            <h3>{props.resourceId ? "Muokkaa resurssityyppiä" : "Uusi resurssityyppi"}</h3>
            <Link to="/resources/">Palaa</Link>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateResourceType();
            }}>
                <div className="row">
                    <input type="hidden" disabled={true} value={props.resourceId} />
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
                    <input type="button" value="Poista resurssityyppi"
                        onClick={(e) => {
                            e.preventDefault();
                            removeResourceType();
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

export default ResourceType
