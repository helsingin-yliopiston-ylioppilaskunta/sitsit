import { useState, useEffect } from 'react';
import api from '../../api';

import './Resource.css'

import { components } from '../../schema';

import { Link, useNavigate } from "react-router";
import Status from "../../status";

interface ResourceProps {
    resourceId?: number;
}

function Resource(props: ResourceProps) {
    const [status, setStatus] = useState(Status.Loading);
    const [errorMsg, setErrorMsg] = useState("");
    const [modified, setModified] = useState(false);

    const [name, setName] = useState("");
    const [group, setGroup] = useState(1);
    const [resourceType, setResourceType] = useState(1);

    const [groups, setGroups] = useState<components["schemas"]["PublicGroup"][]>([]);

    const [resourceTypes, setResourceTypes] =
        useState<components["schemas"]["PublicResourceType"][]>([]);

    const navigate = useNavigate();

    const { data, error: getError, isLoading } = props.resourceId ?
        api.useQuery(
            "get", "/resources/{resource_id}", {
            params: {
                path: { resource_id: props.resourceId }
            }
        }) : { data: undefined, error: undefined, isLoading: false };

    const { data: groupResponse, error: groupError, isLoading: groupLoading } = api.useQuery(
        "get", "/groups/"
    );

    const { data: resourceTypeResponse, error: resourceTypeError, isLoading: resourceTypeLoading } = api.useQuery(
        "get", "/resourcetypes/"
    );

    const { mutate: updateResource, isPending: updating } =
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

    const { mutate: createResource, isPending: creating } =
        api.useMutation(
            "post", "/resources/", {
            onSuccess: () => {
                setModified(false);
                setStatus(Status.Success);
                navigate("/resources/");
            },
            onError: (error: { detail?: components["schemas"]["ValidationError"][] }) => {
                setStatus(Status.Error)
                setErrorMsg(`${error.detail}`)
            }
        }
        );

    const { mutate: deleteResource, isPending: deleting } =
        api.useMutation(
            "delete", "/resources/{resource_id}", {
            params: {
                path: { resource_id: props.resourceId }
            },
            onSuccess: () => {
                setModified(false);
                setStatus(Status.Success);
                navigate("/resources/");
            },
            onError: (error: { detail?: components["schemas"]["ValidationError"][] }) => {
                setStatus(Status.Error)
                setErrorMsg(`${error.detail}`)
            }
        }
        );

    const handleUpdateResource = () => {
        const resource = {
            name: name,
            group_id: group,
            resource_type_id: resourceType,
        };

        console.log(resource);

        if (props.resourceId) {
            updateResource({
                params: {
                    path: { resource_id: props.resourceId || -1 }
                },
                body: resource
            });
        } else {
            createResource({
                body: resource
            })
        }
    };

    const removeResource = () => {
        deleteResource({ params: { path: { resource_id: props.resourceId || -1 } } })
    }

    const isAnyLoading = isLoading || groupLoading || resourceTypeLoading || creating || updating || deleting;

    const combinedError = getError || groupError || resourceTypeError;

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
            setGroup(data.group.id);
            setResourceType(data.resource_type.id);
        }
    }, [data])

    useEffect(() => {
        if (groupResponse) {
            setGroups(groupResponse);
            setGroup(Math.min(...groupResponse.map(group => group.id)));
        }
    }, [groupResponse]);

    useEffect(() => {
        if (resourceTypeResponse) {
            setResourceTypes(resourceTypeResponse);
            setResourceType(Math.min(...resourceTypeResponse.map(resourceType => resourceType.id)));
        }
    }, [resourceTypeResponse])

    return (
        <div className={`Resource status-${status}`}>
            <h3>{props.resourceId ? "Muokkaa resurssia" : "Uusi resurssi"}</h3>
            <Link to="/resources/">Palaa</Link>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateResource();
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
                    <label>Ryhmä</label>
                    <select name="group" id="group"
                        value={group}
                        onChange={(e) => {
                            setGroup(parseInt(e.target.value));
                            setModified(true);
                        }}
                    >
                        {groups?.map((group) => (
                            <option value={group.id} key={group.id} >{group.name}</option>
                        ))}
                    </select>
                </div>
                <div className="row">
                    <label>Resurssin tyyppi</label>
                    <select name="resourceType" id="resourceType"
                        value={resourceType}
                        onChange={(e) => {
                            console.log("Setting resource type as:", e.target.value);
                            setResourceType(parseInt(e.target.value));
                            setModified(true);
                        }}
                    >
                        {resourceTypes?.map((resourceType) => (
                            <option value={resourceType.id} key={resourceType.id} >{resourceType.name}</option>
                        ))}
                    </select>
                </div>
                <div className="row">
                    <input type="submit" disabled={!modified} value="Tallenna" />
                    <input type="button" value="Poista resurssi"
                        onClick={(e) => {
                            e.preventDefault();
                            removeResource();
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

export default Resource
