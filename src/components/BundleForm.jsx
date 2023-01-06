import { 
    ActionList,
    Button,
    Card,
    Checkbox,
    DropZone,
    EmptyState,
    FormLayout,
    Icon,
    Layout,
    Modal,
    Page,
    PageActions,
    Popover,
    Select,
    Spinner,
    Stack,
    Text,
    TextField,
    TextStyle,
    Thumbnail
} from "@shopify/polaris";
import { ContextualSaveBar, Loading, ResourcePicker, useAppBridge, useNavigate, useToast } from '@shopify/app-bridge-react';
import { useCallback, useState } from "react";
import { useForm, useField, notEmptyString, useDynamicList } from '@shopify/react-form';
import { imageURL } from '../helper';
import { CancelSmallMinor, NoteMinor, ImageMajor, AlertMinor, DeleteMinor, ViewMinor } from '@shopify/polaris-icons';
import { useAuthenticatedFetch } from '../hooks';
import { TextEditor } from "./TextEditor";

const convertProductsToString = (products) => {
    return products.map((product) => {
        const product_id = product.id.split('/').pop();
        return `${product_id}=${product.handle}`
    }).join('||');
}

export function BundleForm({ Bundle: InitialBundle }) {
    const fetch = useAuthenticatedFetch();
    const navigate = useNavigate();
    const {hostOrigin} = useAppBridge();
    const {show} = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [bundle, setBundle] = useState(InitialBundle);
    const [showProductPicker, setShowProductPicker] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState(bundle?.products || []);
    const [openModal, setOpenModal] = useState(false);
    const [previewImage, setPreviewImage] = useState();
    const [uploading, setUploading] = useState(false);
    const [activeImgDialogue, setActiveImgDialogue] = useState(false);
    const [popoverImgActive, setPopoverImgActive] = useState(false);
    const [minimumThreshold, setMinimumThreshold] = useState(Math.max((bundle?.minimum_threshold || 0), 0));
    const [savedTiers, setSavedTiers] = useState(bundle?.discount_tiers || [{
        discount_threshold: '',
        discount: ''
    }]);

    const onSubmit = useCallback(
        (body) => {
            (async () => {
                makeClean();
                const BundleId = bundle?.id;
                const url = BundleId ? `/api/bundles/${BundleId}` : `/api/bundles`;
                const method = BundleId ? 'PATCH' : 'POST';
                //const uid = BundleId ?? parseInt(Date.now() + Math.random());
                body['id'] = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '').replace(/^-/, '');
                setSubmitting(true);
                setSavedTiers(body.discount_tiers);

                if (bundle?.image) body['image'] = bundle.image;

                const response = await fetch(url, {
                    method,
                    body: JSON.stringify(body),
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    const result = await response.json();
                    if (!BundleId) {
                        navigate(`/bundles/${result.handle}`);
                        show('Bundle created', { duration: 3000 });
                    } else {
                        setBundle(result);
                        show('Bundle updated', { duration: 3000 });
                    }
                } else {
                    show('Internal server error', { duration: 3000, isError: true });
                }

                tmp_image.onChange('');
                tmp_image.newDefaultValue('');
                removed_image.onChange('');
                removed_image.newDefaultValue('');
                setPreviewImage();
                setSubmitting(false);
            })();
            return { status: "success" };
        }, 
        [bundle, setBundle]
    );

    const emptyTierFactory = (tier) => ({
        discount_threshold: tier?.discount_threshold || '',
        discount: tier?.discount || ''
    });

    const {
        fields: {
            title,
            description,
            productsInput,
            discount_type,
            discount_trigger,
            minimum_threshold,
            tmp_image,
            removed_image,
            show_variants,
            discount_name,
            extra_class         
        },
        dynamicLists: {
            discount_tiers
        },
        submit,
        dirty,
        reset,
        makeClean
    } = useForm({
        fields: {
            title: useField({
                value: bundle?.title || "",
                validates: [notEmptyString('Please enter title')]
            }),
            description: useField(bundle?.description),
            productsInput: useField({
                value: bundle?.products ? convertProductsToString(bundle.products) : "",
                validates: [notEmptyString('Please select a products')]
            }),
            discount_type: useField(bundle?.discount_type || 'percentage'),
            discount_trigger: useField(bundle?.discount_trigger || 'total_products'),
            minimum_threshold: useField({
                value: typeof bundle?.minimum_threshold === 'undefined' ? -1 : bundle.minimum_threshold,
                validates: (value) => {
                    if(value === '') return 'Please enter a value';
                    if(isNaN(parseInt(value))) return 'Please enter a valid value';
                }
            }),
            tmp_image: useField(''),
            removed_image: useField(''),
            show_variants: useField(bundle?.show_variants ?? true),
            discount_name: useField({
                value: bundle?.discount_name || 'Bundle discount',
                validates: [notEmptyString('Please enter discount name')]
            }),
            extra_class: useField(bundle?.extra_class || '')
        },
        dynamicLists: {
            discount_tiers: useDynamicList({
                list: savedTiers,
                validates: {
                    discount_threshold: (discount_threshold) => {
                        if(discount_threshold === '') return `Please enter ${discount_trigger.value === 'total_price' ? 'price' : 'quantity'}`;
                    },
                    discount: (discount) => {
                        if(discount === '' || discount < 0) return 'Please enter valid discount';
                    }
                }
            }, emptyTierFactory),
        },
        onSubmit
    });

    const loadingMarkup = submitting ? (
        <Loading />
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
            setOpenModal(false);
            navigate('/bundles');
            show('Bundle removed', { duration: 3000 });
        }
        setDeleting(false);
    }, [bundle]);

    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];

    const handleDrop = useCallback(async (_dropFiles, acceptedFiles, _rejectedFiles) => {
        if(!acceptedFiles.length) return;

        setUploading(true);
        const response = await fetch('/api/stageBundleImg', {
            method: 'POST',
            body: JSON.stringify({
                input: {
                    fileSize: acceptedFiles[0].size.toString(),
                    filename: acceptedFiles[0].name,
                    httpMethod: "POST",
                    mimeType: acceptedFiles[0].type,
                    resource: "IMAGE"
                }
            }),
            headers: {
                'Content-type': 'application/json'
            }
        });
        if(response.ok) {
            const result = await response.json();

            const formData = new FormData();
            result.parameters.map(({name, value}) => {
                formData.append(name, value);
            });
            formData.append('file', acceptedFiles[0]);

            try {
                const response = await fetch(result.url, {
                    method: 'POST',
                    body: formData
                });

                if(!response.ok) throw(new Error('Image could not be uploaded'));

                tmp_image.onChange(result.resourceUrl);
                setPreviewImage(acceptedFiles[0]);
                if(bundle?.image) removed_image.onChange(bundle.image.id);
            } catch(error) {
                show(error.message, { duration: 3000, isError: true });
            }
        }
        setUploading(false);
    }, [bundle]);

    const pagePrimaryAction = {
        content: "Save",
        onClick: submit,
        loading: submitting,
        disabled: submitting || !dirty
    }

    let min_threshold = [], filled_tiers = 0;
    discount_tiers.fields.map((field, index) => {
        if(index === 0) {
            min_threshold.push(1);
        } else {
            let prev_field = discount_tiers.fields[index - 1];
            if(prev_field.discount_threshold.value === '') {
                min_threshold.push(1);
            } else {
                min_threshold.push(parseInt(prev_field.discount_threshold.value) + 1);
            }
        }
        if(field.discount_threshold.value !== '') filled_tiers++;
    });

    return (
        <Page
            breadcrumbs={[{ content: 'bundles', url: '/bundles' }]}
            title={bundle?.title ? bundle.title : 'New bundle'}
            primaryAction={bundle?.id ?
                <Button
                    icon={ViewMinor}
                    url={`${hostOrigin}/apps/ca/bundle/${bundle.id}`}
                    external
                >Preview</Button>
                : null
            }
        >
            {loadingMarkup}
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
                                setPreviewImage();
                                setSelectedProducts(bundle?.products || []);
                            },
                            loading: submitting,
                            disabled: submitting
                        }}
                        visible={dirty}
                        fullWidth
                    />
                    <Card sectioned>
                        <FormLayout>
                            <TextField 
                                {...title}
                                label="Title*"
                            />

                            <div>
                                <div className="Polaris-Labelled__LabelWrapper">
                                    <div className="Polaris-Label">
                                        <label className="Polaris-Label__Text">Description</label>
                                    </div>
                                </div>
                                <TextEditor content={description} />
                            </div>
                        </FormLayout>
                    </Card>
                    <Card
                        title="Products"
                        actions={[
                            {
                                content: productsInput.value ? "Change products" : "Select products",
                                onAction: toggleProductPicker
                            }
                        ]}
                    >
                        <ResourcePicker
                            open={showProductPicker}
                            resourceType="Product"
                            showVariants={false}
                            selectMultiple={24}
                            onCancel={toggleProductPicker}
                            onSelection={handleSelection}
                            initialSelectionIds={initialProductsIds}
                        />
                        {productsInput.value ? (
                            <div className="rowList">
                                {selectedProducts.map((product, index) => (
                                    <div className="rowItem" key={product.id}>
                                        <Stack vertical={false} alignment="center" spacing="baseTight"> 
                                            <span className="indexNo">{index + 1}.</span>
                                            <Thumbnail
                                                source={product?.image ?? ImageMajor}
                                                alt={product.title}
                                                size="small"
                                            />                                                        
                                            <Stack.Item fill>
                                                <TextStyle>{product.title}</TextStyle>
                                            </Stack.Item>
                                            <Button icon={CancelSmallMinor} plain onClick={() => handleRemove(product.handle)} />
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

                    <Card title="Discounts" >
                        <Card.Section>
                            <Stack distribution="fillEvenly">
                                <Select
                                    label="Discount type"
                                    options={[
                                        { label: "Percentage discount", value: "percentage" },
                                        { label: "Fixed discount", value: "fixed" }
                                    ]}
                                    {...discount_type}
                                />

                                <Select
                                    label="Discount trigger"
                                    options={[
                                        { label: "Total number of products", value: "total_products" },
                                        { label: "Total price", value: "total_price" }
                                    ]}
                                    {...discount_trigger}
                                />

                                <Stack.Item fill={true}>
                                    <Stack vertical spacing="extraTight">
                                        <Checkbox 
                                            label={`Set minimum ${discount_trigger.value === 'total_price' ? 'price' : 'quantity'} required for checkout`}
                                            checked={minimum_threshold.value !== -1}
                                            onChange={(value) => {
                                                if(minimum_threshold.value === -1) {
                                                    minimum_threshold.onChange(minimumThreshold)
                                                } else {
                                                    minimum_threshold.onChange(-1);
                                                }
                                            }}
                                        />

                                        {minimum_threshold.value !== -1 && (
                                            <div className="max-wMdUp-17">
                                                <TextField
                                                    type="number"
                                                    autoComplete="off"
                                                    value={minimum_threshold.value}
                                                    onChange={(value) => {
                                                        let val = parseInt(value);
                                                        val = isNaN(val) ? '' : val;
                                                        minimum_threshold.onChange(val);
                                                        setMinimumThreshold(Math.max(val, 0));
                                                    }}
                                                    error={minimum_threshold.error}
                                                />
                                            </div>
                                        )}     
                                    </Stack>                               
                                </Stack.Item>
                            </Stack>
                        </Card.Section>

                        <Card.Section>
                            <Stack spacing="baseTight">
                                {discount_tiers.fields.map((field, index) => (
                                    <Stack.Item fill key={index}>
                                        <Stack vertical spacing="tight">
                                            <Text variant="headingSm" as="h6">Tier {index + 1}</Text>
                                            <Stack.Item fill>
                                                <Stack spacing="tight" alignment="trailing" >
                                                    <Stack.Item fill>
                                                        <Stack spacing="tight" distribution="fillEvenly">
                                                            <TextField
                                                                label={`Discount after this ${discount_trigger.value === 'total_price' ? 'price' : 'quantity'}*`}
                                                                type="number"
                                                                autoComplete="off"
                                                                disabled={(index + 1) < discount_tiers.fields.length}
                                                                min={min_threshold[index]}
                                                                value={field.discount_threshold.value}
                                                                onChange={field.discount_threshold.onChange}
                                                                onBlur={(e) => {
                                                                    field.discount_threshold.onBlur();
                                                                    if(!e.target.value) return;
                                                                    if(parseInt(e.target.value) < min_threshold[index]) field.discount_threshold.onChange(min_threshold[index].toString());
                                                                }}
                                                                error={field.discount_threshold.error}
                                                            />
                                                            <TextField
                                                                label="Discount*"
                                                                type="number"
                                                                autoComplete="off"
                                                                min={0}
                                                                max={discount_type.value === 'percentage' ? 100 : null}
                                                                suffix={discount_type.value === 'percentage' ? '%' : null}
                                                                {...field.discount}
                                                            />
                                                        </Stack>
                                                    </Stack.Item>
                                                    <Stack.Item>
                                                        <Button
                                                            disabled={index <= 0}
                                                            icon={DeleteMinor}
                                                            onClick={() => discount_tiers.removeItem(index)}
                                                        />
                                                        {(field.discount_threshold.error || field.discount.error) && (
                                                            <div className="space-top-6"></div>
                                                        )}
                                                    </Stack.Item>
                                                </Stack>
                                            </Stack.Item>
                                        </Stack>
                                    </Stack.Item>
                                ))}
                            </Stack>
                        </Card.Section>

                        <Card.Section>
                            <Button
                                onClick={() => discount_tiers.addItem()}
                                disabled={filled_tiers < discount_tiers.fields.length || discount_tiers.fields.length > 2}
                            >Add tier</Button>
                        </Card.Section>
                    </Card>
                    {bundle?.id && (
                        <Card sectioned>
                            <TextField
                                label="Page URL"
                                value={`${hostOrigin}/apps/ca/bundle/${bundle.id}`}
                                disabled={true}
                                connectedRight={<Button primary onClick={() => { navigator.clipboard.writeText(`${hostOrigin}/apps/ca/bundle/${bundle.id}`); show('Copied to clipboard', { duration: 3000 }); }}>Copy link</Button>}
                            />                                                            
                        </Card>
                    )}
                </Layout.Section>

                <Layout.Section secondary>
                    <Card subdued sectioned>
                        <div className="space-bottom-5">
                            <Stack>
                                <Stack.Item fill>
                                    <Text variant="headingMd" as="h2">Bundle image</Text>
                                </Stack.Item>

                                {(previewImage || (bundle?.image && !removed_image.value)) && (
                                    <Popover
                                        active={popoverImgActive}
                                        activator={
                                            <Button 
                                                plain
                                                onClick={() => setPopoverImgActive(!popoverImgActive)}
                                            >Edit</Button>
                                        }    
                                        onClose={() => setPopoverImgActive(!popoverImgActive)}
                                    >
                                        <ActionList 
                                            items={
                                                [
                                                    {
                                                        content: 'Change image',
                                                        onAction: () => {
                                                            setActiveImgDialogue(!activeImgDialogue);
                                                        }
                                                    },
                                                    {
                                                        content: 'Remove',
                                                        destructive: true,
                                                        onAction: () => {
                                                            if(previewImage) setPreviewImage();
                                                            if(tmp_image) tmp_image.onChange('');
                                                            if(bundle?.image) removed_image.onChange(bundle.image.id);
                                                            setPopoverImgActive(!popoverImgActive);
                                                        }
                                                    }
                                                ]
                                            }
                                        />
                                    </Popover>
                                )}
                            </Stack>
                        </div>
                        
                        {uploading ? (
                            <div className="center-10">
                                <Spinner accessibilityLabel="Uploading image" size="large" />
                            </div>
                        ) : (
                            <DropZone 
                                accept="image/*" 
                                allowMultiple={false} 
                                dropOnPage 
                                type="image" 
                                errorOverlayText="File must be .gif, .jpg, or .png"
                                onDrop={handleDrop}
                                openFileDialog={activeImgDialogue}
                                onFileDialogClose={() => setActiveImgDialogue(!activeImgDialogue)}
                            >
                                {previewImage ? (
                                    <div className="preview-image">
                                        <img 
                                            alt={previewImage.name}
                                            src={
                                                validImageTypes.includes(previewImage.type)
                                                    ? window.URL.createObjectURL(previewImage)
                                                    : NoteMinor
                                            }
                                        />
                                    </div>
                                ) : (bundle?.image && !removed_image.value) ? (
                                    <div className="preview-image">
                                        <img 
                                            alt={bundle.image.alt}
                                            src={imageURL(bundle.image.url, 'large')}
                                        />
                                    </div>
                                ) : (
                                    <DropZone.FileUpload actionHint="or drop an image to upload" />
                                )}                         
                            </DropZone>
                        )}
                    </Card>

                    <Card sectioned subdued title="Additional settings">
                        <FormLayout>
                            <Checkbox
                                label="Show variants"
                                checked={show_variants.value}
                                onChange={(value) => show_variants.onChange(value)}
                            />
                            <TextField 
                                label="Discount name"
                                autoComplete="off"
                                helpText="The discount name will be shown on the checkout page."
                                {...discount_name}
                            />
                            <TextField 
                                label="Additional class"
                                autoComplete="off"
                                helpText="For developer use."
                                {...extra_class}
                            />
                        </FormLayout>
                    </Card>
                </Layout.Section>

                <Layout.Section>
                    {bundle?.id ? (
                        <PageActions
                            primaryAction={pagePrimaryAction}
                            secondaryActions={[
                                {
                                    content: "Delete",
                                    destructive: true,
                                    loading:deleting,
                                    disabled: deleting || submitting,
                                    onClick:() => setOpenModal(true)
                                }
                            ]}
                        />
                    ) : (
                        <PageActions
                            primaryAction={pagePrimaryAction}
                        />
                    )}
                </Layout.Section>

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
            </Layout>
        </Page>
    )
}