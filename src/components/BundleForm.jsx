import { Button, Card, EmptyState, Form, Frame, Icon, Layout, Link, Modal, Stack, Text, TextField, TextStyle, Thumbnail, Toast } from "@shopify/polaris";
import { ContextualSaveBar, ResourcePicker, useNavigate } from '@shopify/app-bridge-react';
import { useCallback, useState } from "react";
import { useForm, useField, notEmptyString } from '@shopify/react-form';
import { imageURL } from '../helper';
import { ImageMajor, AlertMinor } from '@shopify/polaris-icons';
import { useAuthenticatedFetch } from '../hooks';

const convertProductsToString = (products) => {
    return products.map((product) => {
        const product_id = product.id.split('/').pop();
        return `${product_id}=${product.handle}`
    }).join('||');
}

export function BundleForm({ Bundle: InitialBundle }) {
    const fetch = useAuthenticatedFetch();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [bundle, setBundle] = useState(InitialBundle);
    const [showProductPicker, setShowProductPicker] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState(bundle?.products || []);
    const [openModal, setOpenModal] = useState(false);

    const toastMarkup = submitted ? (
        <Toast 
            content="Bundle updated" 
            onDismiss={() => {
                setSubmitted(false);
            }}
        />
    ) : null;

    const onSubmit = useCallback(
        (body) => {
            (async () => {
                const BundleId = bundle?.id;
                const url = BundleId ? `/api/bundles/${BundleId}` : `/api/bundles`;
                const method = BundleId ? 'PATCH' : 'POST';
                const uid = BundleId ?? parseInt(Date.now() + Math.random());
                body['id'] =  uid;
                setSubmitting(true);
                const response = await fetch(url, {
                    method: method,
                    body: JSON.stringify(body),
                    headers: { 'Content-Type': 'application/json' }
                });
                if(response.ok) {
                    makeClean();
                    const bundle = await response.json();
                    if(!BundleId) {
                        navigate(`/bundles/${uid}`);
                    } else {
                        setBundle(bundle);
                        setSubmitted(true);
                        setSubmitting(false);
                    }
                }
            })();
            return { status: "success" };
        }, 
        [bundle, setBundle]
    )

    const {
        fields: {
            title,
            productsInput
        },
        submit,
        dirty,
        reset,
        submitErrors,
        makeClean
    } = useForm({
        fields: {
            title: useField({
                value: bundle?.title || "",
                validates: [notEmptyString('Please enter title')]
            }),
            productsInput: useField({
                value: bundle?.products ? convertProductsToString(bundle.products) : "",
                validates: [notEmptyString('Please select a products')]
            })
        },
        onSubmit
    });

    const toggleProductPicker = useCallback(
        () => setShowProductPicker(!showProductPicker),
        [showProductPicker]
    );

    const handleSelection = useCallback(({ selection }) => {
        const products = selection.map((product) => {
            let image = product.images.length ? product.images[0].originalSrc : null;
            let available_variant = product.variants[0];
            if(image != null) image = imageURL(image, 'small');

            if(!available_variant.availableForSale) {
                for(var i = 0; i < product.variants.length; i++) {
                    let variant = product.variants[i];
                    if(variant.availableForSale) {
                        available_variant = variant;
                        break;
                    }
                }
            }
            
            return {
                handle: product.handle,
                id: product.id,
                image: image,
                title: product.title
            }
        })

        productsInput.onChange(convertProductsToString(products));
        setSelectedProducts(products);
        setShowProductPicker(false);
    },[]);

    const handleFormReset = () => {
        setSelectedProducts(bundle?.products || []);
    }

    const handleRemove = useCallback((handle) => {
        const products = selectedProducts.filter((product) => {
            return product.handle !== handle
        })
        productsInput.onChange(convertProductsToString(products));
        setSelectedProducts(products);
        
    }, [selectedProducts, setSelectedProducts]);

    const initialProductsIds = [];
    selectedProducts.map((product, index) => {
        initialProductsIds[index] = {
            id: product.id
        };
    });
    
    const handleDeleteBundle = useCallback(async () => {
        if(!bundle?.id) return;
        setDeleting(true);

        const response = await fetch(`/api/bundles/${bundle.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if(response.ok) {
            setDeleting(false);
            setOpenModal(false);
            navigate('/');
        }
    }, [bundle])

    return (
        <Frame>
            <Layout>
                <Layout.Section>
                    <Form onSubmit={submit}>
                        <ContextualSaveBar 
                            saveAction={{
                                label: "Save",
                                onAction: submit,
                                loading: submitting,
                                disabled: submitting
                            }}
                            discardAction={{
                                label: "Discard",
                                onAction: () => {
                                    reset();
                                    handleFormReset();
                                },
                                loading: submitting,
                                disabled: submitting
                            }}
                            visible={dirty}
                            fullWidth={true}
                        />
                        <Card sectioned title="Title">
                            <TextField 
                                {...title}
                                label="Title"
                                labelHidden
                                helpText="Only store member can see this"
                            />
                        </Card>
                        <Card
                            title="Products"
                            actions={[
                                {
                                    content: productsInput.value ? "Change product" : "Select product",
                                    onAction: toggleProductPicker
                                }
                            ]}
                        >
                            <Card.Section>
                                <ResourcePicker
                                    open={showProductPicker}
                                    resourceType="Product"
                                    showVariants={false}
                                    onCancel={toggleProductPicker}
                                    onSelection={handleSelection}
                                    initialSelectionIds={initialProductsIds}
                                />
                                {productsInput.value ? (
                                    <Stack spacing="loose" vertical>
                                        {selectedProducts.map((product) => (
                                            <Stack vertical={false} alignment="center" key={product.id}> 
                                                <Stack.Item>
                                                    {product.image ? (
                                                        <Thumbnail
                                                            source={product.image}
                                                            alt={product.title}
                                                        />
                                                    ) : (
                                                        <Thumbnail
                                                            source={ImageMajor}
                                                            alt={product.title}
                                                        />
                                                    )}
                                                </Stack.Item>
                                                <Stack.Item fill>
                                                    <TextStyle variation="strong">{product.title}</TextStyle>
                                                </Stack.Item>
                                                <Stack.Item>
                                                    <Link onClick={() => handleRemove(product.handle)}>
                                                        <Text color="warning">Remove</Text>
                                                    </Link>
                                                </Stack.Item>
                                            </Stack>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Stack vertical spacing="extraTight">
                                        <EmptyState>
                                            <p>Your selected products will appear here</p>
                                        </EmptyState>
                                        {productsInput.error && (
                                            <Stack spacing="tight">
                                                <Icon source={AlertMinor} color="critical" />
                                                <TextStyle variation="negative">{productsInput.error}</TextStyle>
                                            </Stack>
                                        )}
                                    </Stack>
                                ) } 
                            </Card.Section>
                        </Card>
                        {toastMarkup}
                    </Form>
                </Layout.Section>
                {bundle?.id && (
                    <>
                        <Modal
                            open={openModal}
                            onClose={() => setOpenModal(false)}
                            title="Confirm deletion"
                            primaryAction={{
                                content: 'Delete',
                                destructive: true,
                                loading: deleting,
                                disabled: deleting,
                                onAction: handleDeleteBundle
                            }}
                            secondaryActions={[
                                {
                                    content: "Cancel",
                                    disabled: deleting,
                                    onAction: () => setOpenModal(false)
                                }
                            ]}
                        >
                            <Modal.Section>
                                <p>Are you sure you want to delete this bundle?</p>
                            </Modal.Section>
                        </Modal>
                        <Layout.Section>
                            <Button 
                                destructive
                                loading={deleting}
                                disabled={deleting || submitting}
                                onClick={() => setOpenModal(true)}
                            >Delete bundle</Button>
                        </Layout.Section>
                    </>
                )}
            </Layout>
        </Frame>
    )
}