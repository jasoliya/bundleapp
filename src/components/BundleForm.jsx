import { Card, EmptyState, Form, Icon, Layout, Link, Stack, Text, TextField, TextStyle, Thumbnail } from "@shopify/polaris";
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

export function BundleForm() {
    const fetch = useAuthenticatedFetch();
    const navigate = useNavigate();
    const [showProductPicker, setShowProductPicker] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);

    const onSubmit = useCallback(
        (body) => {
            (async () => {
                const uid = parseInt(Date.now() + Math.random());
                body['id'] =  uid;
                const response = await fetch('/api/bundles', {
                    method: 'POST',
                    body: JSON.stringify(body),
                    headers: { 'Content-Type': 'application/json' }
                });
                if(response.ok) {
                    makeClean();
                    await response.json();
                    navigate(`/bundles/${uid}`);
                }
            })();
            return { status: "success" }
        }, 
        []
    )

    const {
        fields: {
            title,
            productsInput
        },
        submit,
        submitting,
        dirty,
        reset,
        submitErrors,
        makeClean
    } = useForm({
        fields: {
            title: useField({
                value: "",
                validates: [notEmptyString('Please enter title')]
            }), 
            productsInput: useField({
                value: "",
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
                title: product.title,
                variant: {
                  id: available_variant.id,
                  compare_at_price: available_variant.compareAtPrice
                }
            }
        })

        productsInput.onChange(convertProductsToString(products));
        setSelectedProducts(products);
        setShowProductPicker(false);
    },[]);

    const handleFormReset = () => {
        setSelectedProducts([]);
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
    
    return (
        <Layout>
            <Layout.Section>
                <Form>
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
                </Form>
            </Layout.Section>
        </Layout>
    )
}