import { useNavigate } from "@shopify/app-bridge-react";
import { Button, ButtonGroup, Card, Frame, IndexTable, Modal, TextStyle, Toast } from "@shopify/polaris";
import { useCallback } from "react";
import { useState } from "react";
import { useAuthenticatedFetch } from "../hooks";

export function BundleIndex({ bundleList: bundles, loading, parentCallback }) {
    const navigate = useNavigate();
    const fetch = useAuthenticatedFetch();
    const [ openModal, setOpenModal ] = useState(false);
    const [ deleteId, setDeleteId ] = useState();
    const [ deleting, setDeleting ] = useState(false);
    const [ deleted, setDeleted ] = useState(false);

    const resourceName = {
        singular: 'bundle',
        plural: 'bundles',
    };

    const toggleModal = useCallback(() => setOpenModal(!openModal), [openModal]);

    const toastMarkup = deleted ? (
        <Toast 
            content="Bundle removed"
            onDismiss={() => {
                setDeleted(false);
            }}
        />
    ) : null;

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
            parentCallback(result_bundles);
        }
        setDeleting(false);
        setOpenModal(false);
        setDeleted(true);
    }, [deleteId, setDeleteId, openModal, setOpenModal, deleting, setDeleting])

    const rowMarkup = bundles.map(({ id, title, item_counts }, index) => {
        return (
            <IndexTable.Row
                id={id}
                key={id}
                position={index}
            >
                <IndexTable.Cell className="w-60">
                    <TextStyle variation="strong">{title}</TextStyle>
                </IndexTable.Cell>
                <IndexTable.Cell className="w-20">
                    <TextStyle variation="subdued">{item_counts}</TextStyle>
                </IndexTable.Cell>
                <IndexTable.Cell className="w-20">
                    <ButtonGroup segmented>
                        <Button
                            onClick={() => navigate(`/bundles/${id}`)}
                            disabled={deleting}
                        >Edit</Button>
                        <Button destructive disabled={deleting}
                            onClick={() => handleDelete(id)}
                        >Delete</Button>
                    </ButtonGroup>
                </IndexTable.Cell>
            </IndexTable.Row>
        )
    })

    return (
        <Frame>
            <Card sectioned title="Bundles">
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
                        { title: 'Items' },
                        { title: 'Action' },
                    ]}
                    selectable={false}
                    loading={loading}
                >
                    {rowMarkup}
                </IndexTable>
            </Card>
            {toastMarkup}
        </Frame>
    );
}