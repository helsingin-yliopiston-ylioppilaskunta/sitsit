import { useState, useEffect } from 'react';
import api from '../../api';

import './Org.css'

import { components } from '../../schema';

import { Link, useNavigate } from "react-router";
import Status from "../../status";

interface OrgProps {
    orgId?: number;
}

function Org(props: OrgProps) {
    const [status, setStatus] = useState(Status.Loading);
    const [errorMsg, setErrorMsg] = useState("");
    const [modified, setModified] = useState(false);

    const [name, setName] = useState("");

    const navigate = useNavigate();

    const { data, error: getError, isLoading } = props.orgId
        ? api.useQuery(
            "get", "/orgs/{org_id}", {
            params: {
                path: { org_id: props.orgId! }
            },
        })
        : { data: undefined, error: undefined, isLoading: false };

    const { mutate: updateOrg, isPending: updating } =
        api.useMutation(
            "patch", "/orgs/{org_id}", {
            params: {
                path: { org_id: props.orgId }
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

    const { mutate: createOrg, isPending: creating } =
        api.useMutation(
            "post", "/orgs/", {
            onSuccess: () => {
                setModified(false);
                setStatus(Status.Success);
                navigate("/orgs/");
            },
            onError: (error: { detail?: components["schemas"]["ValidationError"][] }) => {
                setStatus(Status.Error)
                setErrorMsg(`${error.detail}`)
            }
        }
        );

    const { mutate: deleteOrg, isPending: deleting } =
        api.useMutation(
            "delete", "/orgs/{org_id}", {
            params: {
                path: { org_id: props.orgId }
            },
            onSuccess: () => {
                setModified(false);
                setStatus(Status.Success);
                navigate("/orgs/");
            },
            onError: (error: { detail?: components["schemas"]["ValidationError"][] }) => {
                setStatus(Status.Error)
                setErrorMsg(`${error.detail}`)
            }
        }
        );

    const handleUpdateOrg = () => {
        const org = {
            name: name,
        };

        if (props.orgId) {
            updateOrg({
                params: {
                    path: { org_id: props.orgId || -1 }
                },
                body: org
            });
        } else {
            createOrg({
                body: org
            })
        }
    };

    const removeOrg = () => {
        deleteOrg({ params: { path: { org_id: props.orgId || -1 } } })
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
        <div className={`Org status-${status}`}>
            <h3>{props.orgId ? "Muokkaa organisaatiota" : "Uusi organisaatio"}</h3>
            <Link to="/orgs/">Palaa</Link>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateOrg();
            }}>
                <div className="row">
                    <input type="hidden" disabled={true} value={props.orgId} />
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
                    <input type="button" value="Poista organisaatio"
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

export default Org
