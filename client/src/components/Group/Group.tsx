import { useState, useEffect } from 'react';
import api from '../../api';

import './Group.css'

import { components } from '../../schema';

import { Link, useNavigate } from "react-router";
import Status from "../../status";

interface GroupProps {
    groupId?: number;
}

function Group(props: GroupProps) {
    const [status, setStatus] = useState(Status.Loading);
    const [errorMsg, setErrorMsg] = useState("");
    const [modified, setModified] = useState(false);

    const [groupname, setGroupname] = useState("");
    const [collection, setCollection] = useState(1);

    const [collections, setCollections] = useState<components["schemas"]["PublicCollection"][]>([]);

    const navigate = useNavigate();

    const { data, error: getError, isLoading } = props.groupId ?
        api.useQuery(
            "get", "/groups/{group_id}", {
            params: {
                path: { group_id: props.groupId }
            }
        }) : { data: undefined, error: undefined, isLoading: false };

    const { data: collectionResponse, error: collectionError, isLoading: collectionLoading } = api.useQuery(
        "get", "/collections/"
    );

    const { mutate: updateGroup, isPending: updating } =
        api.useMutation(
            "patch", "/groups/{group_id}", {
            params: {
                path: { group_id: props.groupId }
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

    const { mutate: createGroup, isPending: creating } =
        api.useMutation(
            "post", "/groups/", {
            onSuccess: () => {
                setModified(false);
                setStatus(Status.Success);
                navigate("/groups/");
            },
            onError: (error: { detail?: components["schemas"]["ValidationError"][] }) => {
                setStatus(Status.Error)
                setErrorMsg(`${error.detail}`)
            }
        }
        );

    const { mutate: deleteGroup, isPending: deleting } =
        api.useMutation(
            "delete", "/groups/{group_id}", {
            params: {
                path: { group_id: props.groupId }
            },
            onSuccess: () => {
                setModified(false);
                setStatus(Status.Success);
                navigate("/groups/");
            },
            onError: (error: { detail?: components["schemas"]["ValidationError"][] }) => {
                setStatus(Status.Error)
                setErrorMsg(`${error.detail}`)
            }
        }
        );

    const handleUpdateGroup = () => {
        const group = {
            name: groupname,
            collection_id: collection,
        };

        if (props.groupId) {
            updateGroup({
                params: {
                    path: { group_id: props.groupId || -1 }
                },
                body: group
            });
        } else {
            createGroup({
                body: group
            })
        }
    };

    const removeGroup = () => {
        deleteGroup({ params: { path: { group_id: props.groupId || -1 } } })
    }

    const isAnyLoading = isLoading || collectionLoading || creating || updating || deleting;

    const combinedError = getError || collectionError;

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
            setGroupname(data.name || "")
            setCollection(data.collection ? data.collection.id : 1);
        }
    }, [data])

    useEffect(() => {
        if (collectionResponse) {
            setCollections(collectionResponse);
        }
    }, [collectionResponse]);

    return (
        <div className={`Group status-${status}`}>
            <h3>{props.groupId ? "Muokkaa ryhmää" : "Uusi ryhmä"}</h3>
            <Link to="/groups/">Palaa</Link>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateGroup();
            }}>
                <div className="row">
                    <input type="hidden" disabled={true} value={props.groupId} />
                </div>
                <div className="row">
                    <label>Nimi</label>
                    <input type="text" value={groupname} onChange={(e) => {
                        setGroupname(e.target.value);
                        setModified(true);
                    }} />
                </div>
                <div className="row">
                    <label>Collection</label>
                    <select name="collection" id="collection"
                        value={collection}
                        onChange={(e) => {
                            setCollection(parseInt(e.target.value));
                            setModified(true);
                        }}
                    >
                        {collections?.map((collection) => (
                            <option value={collection.id} key={collection.id} >{collection.name}</option>
                        ))}
                    </select>
                </div>
                <div className="row">
                    <input type="submit" disabled={!modified} value="Tallenna" />
                    <input type="button" value="Poista ryhmä"
                        onClick={(e) => {
                            e.preventDefault();
                            removeGroup();
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

export default Group
