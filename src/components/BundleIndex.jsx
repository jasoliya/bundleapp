import { useNavigate, useToast } from "@shopify/app-bridge-react";
import { Badge, Button, ButtonGroup, Card, IndexTable, Modal, TextStyle } from "@shopify/polaris";
import { useCallback } from "react";
import { useState } from "react";
import { useAuthenticatedFetch } from "../hooks";

export function BundleIndex({ bundleList: bundles, loading, parentCallback }) {
    const navigate = useNavigate();
    const fetch = useAuthenticatedFetch();
    const {show} = useToast();
    const [ openModal, setOpenModal ] = useState(false);
    const [ deleteId, setDeleteId ] = useState();
    const [ deleting, setDeleting ] = useState(false);

    const resourceName = {
        singular: 'bundle',
        plural: 'bundles',
    };

    const toggleModal = useCallback(() => setOpenModal(!openModal), [openModal]);

    const handleDelete = (id) => {
        setDeleteId(id);
        toggleModal();
    };

    const handleBundleRemove = useCallback(async () => {
        if(!deleteId) return;
        setDeleting(true);
        const response = await fetch(`/api/bundles/${deleteId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        if(response.ok) {
            const result_bundles = await response.json();
            navigate('/');
            parentCallback(result_bundles);
        }
        setDeleting(false);
        setOpenModal(false);
        show('Bundle removed', { duration: 3000 });
    }, [deleteId, setDeleteId, openModal, setOpenModal, deleting, setDeleting])

    const rowMarkup = bundles.map(({ id, title, status, item_counts }, index) => {
        return (
            <IndexTable.Row
                id={id}
                key={id}
                position={index}
            >
                <IndexTable.Cell className="w-40">
                    <TextStyle variation="strong">{title}</TextStyle>
                </IndexTable.Cell>
                <IndexTable.Cell className="w-20">
                    {status ? (
                        <Badge status={status == 'active' ? 'success' : 'info' }>{status == 'active' ? 'Active' : 'Draft'}</Badge>
                    ) : (
                        <>-</>
                    )}
                </IndexTable.Cell>
                <IndexTable.Cell className="w-20">
                    <TextStyle variation="subdued">{item_counts}</TextStyle>
                </IndexTable.Cell>
                <IndexTable.Cell className="w-20">
                    <ButtonGroup segmented>
                        <Button
                            onClick={() => navigate(`/bundles/${id}`)}
                            disabled={deleting}
                            size="slim"
                            accessibilityLabel="Edit bundle"
                        >Edit</Button>
                        <Button 
                            onClick={() => handleDelete(id)}
                            disabled={deleting}
                            size="slim"
                            destructive
                            accessibilityLabel="Remove bundle"
                        >Delete</Button>
                    </ButtonGroup>
                </IndexTable.Cell>
            </IndexTable.Row>
        )
    });

    return (
        <Card>
            <Modal
                open={openModal}
                onClose={toggleModal}
                title="Confirm deletion"
                primaryAction={{
                    content: 'Delete',
                    destructive: true,
                    onAction: handleBundleRemove,
                    loading: deleting,
                    disabled: deleting
                }}
                secondaryActions={[
                    {
                        content: "Cancel",
                        onAction: toggleModal,
                        disabled: deleting
                    }
                ]}
            >
                <Modal.Section>
                    <p>Are you sure you want to delete this bundle?</p>
                </Modal.Section>
            </Modal>
            <IndexTable
                resourceName={resourceName}
                itemCount={bundles.length}
                headings={[
                    { title: 'Name' },
                    { title: 'Status' },
                    { title: 'Items' },
                    { title: 'Action' },
                ]}
                selectable={false}
                loading={loading}
            >
                {rowMarkup}
            </IndexTable>
        </Card>
    );
}