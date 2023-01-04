import { useAppBridge, useNavigate, useToast } from "@shopify/app-bridge-react";
import { Badge, Button, ButtonGroup, Card, IndexTable, Link, Modal, Text, Tooltip } from "@shopify/polaris";
import { EditMinor, DeleteMinor, ViewMinor } from '@shopify/polaris-icons';
import { useCallback } from "react";
import { useState } from "react";
import { useAuthenticatedFetch } from "../hooks";

export function BundleIndex({ bundleList: bundles, loading, parentCallback }) {
    const navigate = useNavigate();
    const fetch = useAuthenticatedFetch();
    const {show} = useToast();
    const { hostOrigin } = useAppBridge();
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
            navigate('/bundles');
            parentCallback(result_bundles);
        }
        setDeleting(false);
        setOpenModal(false);
        show('Bundle removed', { duration: 3000 });
    }, [deleteId, setDeleteId, openModal, setOpenModal, deleting, setDeleting])

    const rowMarkup = bundles.map(({ id, title, status, item_counts, tiers }, index) => {
        return (
            <IndexTable.Row
                id={id}
                key={id}
                position={index}
            >
                <IndexTable.Cell className="w-40">
                    <Link 
                        removeUnderline 
                        monochrome
                        onClick={(event) => {
                            event.preventDefault();
                            navigate(`/bundles/${id}`);
                        }}
                    >
                        <Text variant="bodyMd" fontWeight="bold" as="span">{title.length > 28 ? title.substring(0, 28) + "..." : title}</Text>
                    </Link>
                </IndexTable.Cell>
                <IndexTable.Cell className="w-20">
                    <Text color="subdued" as="span">{item_counts}</Text>
                </IndexTable.Cell>
                <IndexTable.Cell className="w-20">
                    <Text color="subdued" as="span">{tiers}</Text>
                </IndexTable.Cell>
                <IndexTable.Cell className="w-20">
                    <ButtonGroup segmented>
                        <Tooltip content="Edit" dismissOnMouseOut preferredPosition="above">
                            <Button
                                onClick={() => navigate(`/bundles/${id}`)}
                                disabled={deleting}
                                icon={EditMinor}
                                accessibilityLabel="Edit bundle"
                            ></Button>
                        </Tooltip>
                        <Tooltip content="Preview" dismissOnMouseOut preferredPosition="above">
                            <Button
                                onClick={() => window.open(`${hostOrigin}/apps/ca/bundle/${id}`, '_blank').focus()}
                                disabled={deleting}
                                icon={ViewMinor}
                                accessibilityLabel="View bundle"
                            ></Button>
                        </Tooltip>
                        <Tooltip content="Delete" dismissOnMouseOut preferredPosition="above">
                            <Button 
                                onClick={() => handleDelete(id)}
                                disabled={deleting}
                                icon={DeleteMinor}
                                destructive
                                accessibilityLabel="Remove bundle"
                            ></Button>
                        </Tooltip>
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
                    { title: 'Items' },
                    { title: 'Tiers' },
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