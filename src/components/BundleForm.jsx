import { 
    Badge,
    Button,
    Card,
    EmptyState,
    Icon,
    Layout,
    Modal,
    Page,
    Select,
    Stack,
    TextField,
    TextStyle,
    Thumbnail,
    Toast
} from "@shopify/polaris";
import { ContextualSaveBar, ResourcePicker, useNavigate } from '@shopify/app-bridge-react';
import { useCallback, useState } from "react";
import { useForm, useField, notEmptyString } from '@shopify/react-form';
import { imageURL } from '../helper';
import { CancelSmallMinor, ImageMajor, AlertMinor } from '@shopify/polaris-icons';
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
                    const result = await response.json();
                    setSubmitted(true);
                    setSubmitting(false);
                    if(!BundleId) {
                        navigate(`/bundles/${uid}`);
                    } else {
                        setBundle(result);
                    }
                }
            })();
            return { status: "success" };
        }, 
        [bundle, setBundle]
    );

    const {
        fields: {
            title,
            productsInput,
            status
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
            }),
            status: useField(bundle?.status || 'active')
        },
        onSubmit
    });

    const toastMarkup = submitted ? (
        <Toast 
            content="Bundle updated" 
            onDismiss={() => {
                setSubmitted(false);
            }}
        />
    ) : null;

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
    }, [bundle]);

    const statusMarkup = bundle?.status ? (
        <Badge status={bundle.status == 'active' ? 'success' : 'info'}>{bundle.status === 'active' ? 'Active' : 'Draft'}</Badge>
    ) : null;

    return (
        <Page
            breadcrumbs={[{ content: 'bundles', url: '/' }]}
            title={bundle?.title ? bundle.title : 'New bundle'}
            titleMetadata={statusMarkup}
        >
            <Layout>
                <Layout.Section>    
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
                        <ResourcePicker
                            open={showProductPicker}
                            resourceType="Product"
                            showVariants={false}
                            onCancel={toggleProductPicker}
                            onSelection={handleSelection}
                            initialSelectionIds={initialProductsIds}
                        />
                        {productsInput.value ? (
                            <div className="rowList">
                                {selectedProducts.map((product, index) => (
                                    <div className="rowItem" key={product.id}>
                                        <Stack vertical={false} alignment="center" spacing="baseTight"> 
                                            <Stack.Item>
                                                <span className="indexNo">{index + 1}.</span>
                                            </Stack.Item>
                                            <Stack.Item>
                                                <Thumbnail
                                                    source={product?.image ?? ImageMajor}
                                                    alt={product.title}
                                                    size="small"
                                                />                                                        
                                            </Stack.Item>
                                            <Stack.Item fill>
                                                <TextStyle>{product.title}</TextStyle>
                                            </Stack.Item>
                                            <Stack.Item>
                                                <Button icon={CancelSmallMinor} plain onClick={() => handleRemove(product.handle)} />
                                            </Stack.Item>
                                        </Stack>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Card.Section>
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
                            </Card.Section>
                        )} 
                    </Card>
                </Layout.Section>
                <Layout.Section secondary>
                    <Card sectioned title="Bundle status">
                        <Select 
                            options={[
                                { label: 'Active', value: 'active' },
                                { label: 'Draft', value: 'draft' }
                            ]}
                            {...status}
                        />
                    </Card>
                </Layout.Section>
                {toastMarkup}
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
                {bundle?.id && (
                    <Layout.Section>
                        <Button 
                            destructive
                            loading={deleting}
                            disabled={deleting || submitting}
                            onClick={() => setOpenModal(true)}
                        >Delete bundle</Button>
                    </Layout.Section>
                )}
            </Layout>
        </Page>
    )
}