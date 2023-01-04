import { ContextualSaveBar, useToast } from "@shopify/app-bridge-react";
import { Card, Form, FormLayout, Layout, Page, PageActions, RadioButton, Select, Stack, Text, TextField } from "@shopify/polaris";
import { notEmptyString, useField, useForm } from "@shopify/react-form";
import { useCallback, useState } from "react";
import { useAuthenticatedFetch } from "../hooks";
import { ColorSelector } from "./ColorSelector";
import { RangeSelector } from "./RangeSelector";

export function SettingsForm({settings = {}}) {
    const [submitting, setSubmitting] = useState(false);
    const fetch = useAuthenticatedFetch();
    const {show} = useToast();

    const {
        fields: {
            primary_font_size,
            primary_color,
            secondary_font_size,
            secondary_color,
            body_font_size,
            body_color,
            sale_text_color,
            button_corner_radius,
            button_font_size,
            button_back_color,
            button_text_color,
            button_hover_back_color,
            button_hover_text_color,
            custom_css,
            page_width,
            align_page_text,
            align_grid_text,
            grid_size_desktop,
            grid_size_mobile,
            grid_x_spacing,
            grid_y_spacing,
            text_add,
            text_soldout,
            text_price_heading,
            text_checkout,
            text_save_amount,
            text_min_required
        },
        submit,
        dirty,
        reset,
        makeClean
    } = useForm({
        fields: {
            primary_font_size: useField(settings?.primary_font_size || 26),
            primary_color: useField(settings?.primary_color || '#000000'),
            secondary_font_size: useField(settings?.secondary_font_size || 20),
            secondary_color: useField(settings?.secondary_color || '#000000'),
            body_font_size: useField(settings?.body_font_size || 16),
            body_color: useField(settings?.body_color || '#000000'),
            sale_text_color: useField(settings?.sale_text_color || '#b12704'),
            button_corner_radius: useField(settings?.button_corner_radius || 4),
            button_font_size: useField(settings?.button_font_size || 16),
            button_back_color: useField(settings?.button_back_color || '#ffffff'),
            button_text_color: useField(settings?.button_text_color || '#000000'),
            button_hover_back_color: useField(settings?.button_hover_back_color || '#000000'),
            button_hover_text_color: useField(settings?.button_hover_text_color || '#ffffff'),
            custom_css: useField(settings?.custom_css || ''),
            page_width: useField({
                value: settings?.page_width || '1440',
                validates: [notEmptyString('Please enter page width')]
            }),
            align_page_text: useField(settings?.align_page_text || 'left'),
            align_grid_text: useField(settings?.align_grid_text || 'left'),
            grid_size_desktop: useField(settings?.grid_size_desktop || '3'),
            grid_size_mobile: useField(settings?.grid_size_mobile || '1'),
            grid_x_spacing: useField(settings?.grid_x_spacing || 24),
            grid_y_spacing: useField(settings?.grid_y_spacing || 24),
            text_add: useField({
                value: settings?.text_add || 'Add',
                validates: [notEmptyString('Please enter text')]
            }),
            text_soldout: useField({
                value: settings?.text_soldout || 'Sold out',
                validates: [notEmptyString('Please enter text')]
            }),
            text_price_heading: useField({
                value: settings?.text_price_heading || 'Price details',
                validates: [notEmptyString('Please enter text')]
            }),
            text_checkout: useField({
                value: settings?.text_checkout || 'Checkout',
                validates: [notEmptyString('Please enter text')]
            }),
            text_save_amount: useField({
                value: settings?.text_save_amount || 'You will save [amount] on this order.',
                validates: [notEmptyString('Please enter text')]
            }),
            text_min_required: useField({
                value: settings?.text_min_required || 'Minimum [amount] [unit] is required to checkout.',
                validates: [notEmptyString('Please enter text')]
            })
        },
        onSubmit: async data => {
            setSubmitting(true);
            const response = await fetch('/api/settings', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });
            if(response.ok) {
                show('Settings saved', { duration: 3000 })
            } else {
                show('Internal server error', { duration: 3000, isError: true })
            }
            makeClean();
            setSubmitting(false);
            return {status: 'success'};
        }
    });

    const [pageWidth, setPageWidth] = useState(page_width.value !== 'full' ? page_width.value : '1440');

    const handlePageWidthChange = useCallback(
        (_checked, newValue) => {
            if(newValue === 'full') {
                page_width.onChange(newValue);
            } else {
                page_width.onChange(pageWidth);
            }
        }, [pageWidth]
    );

    return (
        <Page title="Settings">
            <ContextualSaveBar
                saveAction={{
                    label: 'Save',
                    onAction: submit,
                    loading: submitting,
                    disabled: submitting
                }}
                discardAction={{
                    label: 'Discard',
                    onAction: reset,
                    loading: submitting,
                    disabled: submitting
                }}
                visible={dirty}
                fullWidth
            />
            
            <Layout>
                <Layout.AnnotatedSection
                    id="design"
                    title="Design"
                    description="All of this customization will allow you to change the font size, color, button style and add custom CSS rules."
                >
                    <Card>
                        <Card.Section>
                            <FormLayout>
                                <Text variant="headingMd" as="h2">Primary heading</Text>
                                <FormLayout.Group>
                                    <RangeSelector 
                                        label='Font size'
                                        min={18}
                                        max={48}
                                        step={2}
                                        range={primary_font_size.value}
                                        changeRange={(value) => primary_font_size.onChange(value)}
                                    />
                                    <ColorSelector color={primary_color.value} for="primary_font_size" changeColor={(value) => primary_color.onChange(value)} />                                
                                </FormLayout.Group>
                            </FormLayout>  
                        </Card.Section>                             
                            
                        <Card.Section>
                            <FormLayout>
                                <Text variant="headingMd" as="h2">Secondary heading</Text>
                                <FormLayout.Group>
                                    <RangeSelector
                                        label='Font size'
                                        min={14}
                                        max={44}
                                        step={2}
                                        range={secondary_font_size.value}
                                        changeRange={(value) => secondary_font_size.onChange(value)}
                                    />
                                    <ColorSelector color={secondary_color.value} for="secondary_font_size" changeColor={(value) => secondary_color.onChange(value)} />
                                </FormLayout.Group>
                            </FormLayout>
                        </Card.Section>
                        
                        <Card.Section>
                            <FormLayout>
                                <Text variant="headingMd" as="h2">Body</Text>
                                <FormLayout.Group>
                                    <RangeSelector
                                        label='Font size'
                                        min={14}
                                        max={28}
                                        step={1}
                                        range={body_font_size.value}
                                        changeRange={(value) => body_font_size.onChange(value)}
                                    />
                                    <ColorSelector color={body_color.value} for="body_font_size" changeColor={(value) => body_color.onChange(value)} />   
                                </FormLayout.Group>
                            </FormLayout>
                        </Card.Section>

                        <Card.Section>
                            <div className="max-wMdUp-17">
                                <ColorSelector label="Sale text color" for="sale_text_color" color={sale_text_color.value} changeColor={(value) => sale_text_color.onChange(value)} />
                            </div>
                        </Card.Section>

                        <Card.Section>
                            <FormLayout>
                                <Text variant="headingMd" as="h2">Buttons</Text>
                                <FormLayout.Group>
                                    <RangeSelector
                                        label='Corner radius'
                                        min={0}
                                        max={24}
                                        step={1}
                                        range={button_corner_radius.value}
                                        changeRange={(value) => button_corner_radius.onChange(value)}
                                    />
                                    <RangeSelector
                                        label='Font size'
                                        min={14}
                                        max={28}
                                        step={1}
                                        range={button_font_size.value}
                                        changeRange={(value) => button_font_size.onChange(value)}
                                    />
                                    <ColorSelector label="Background color" for="button_back_color" color={button_back_color.value} changeColor={(value) => button_back_color.onChange(value)} />
                                    <ColorSelector label="Text color" for="button_text_color" color={button_text_color.value} changeColor={(value) => button_text_color.onChange(value)} />
                                    <ColorSelector label="Background color on hover" for="button_hover_back_color" color={button_hover_back_color.value} changeColor={(value) => button_hover_back_color.onChange(value)} />
                                    <ColorSelector label="Text color on hover" for="button_hover_text_color" color={button_hover_text_color.value} changeColor={(value) => button_hover_text_color.onChange(value)} />
                                </FormLayout.Group>
                            </FormLayout>
                        </Card.Section>

                        <Card.Section>
                            <TextField
                                label="Custom CSS"
                                multiline={8}
                                autoComplete="off"
                                helpText="Add your custom CSS. These will override core CSS of bundle page."
                                monospaced
                                spellCheck={false}
                                {...custom_css}
                            />
                        </Card.Section>
                    </Card>
                </Layout.AnnotatedSection>

                <Layout.AnnotatedSection
                    id="layout"
                    title="Layout"
                    description="Customize page layout as per your requirement."
                >
                    <Card>
                        <Card.Section>
                            <FormLayout>
                                <Text variant="headingMd" as="h2">Page width</Text>
                                <FormLayout.Group>
                                    <RadioButton
                                        label="Full"
                                        name="pagewidth"
                                        id="full"
                                        checked={page_width.value === 'full'}
                                        onChange={handlePageWidthChange}
                                    />
                                    <Stack vertical spacing="baseTight">
                                        <RadioButton
                                            label="Custom"
                                            name="pagewidth"
                                            id="custom"
                                            checked={page_width.value !== 'full'}
                                            onChange={handlePageWidthChange}
                                        />
                                        {page_width.value !== 'full' && (
                                            <TextField
                                                type="number"
                                                suffix="px"
                                                max={1920}
                                                value={page_width.value}
                                                onChange={(value) => {
                                                    const currentValue = parseInt(value) > 1920 ? '1920' : value;
                                                    if(page_width.value !== 'full') page_width.onChange(currentValue);
                                                    setPageWidth(currentValue);
                                                }}
                                                error={page_width.error}
                                            />
                                        )}
                                    </Stack>
                                </FormLayout.Group>
                            </FormLayout>
                        </Card.Section>

                        <Card.Section>
                            <FormLayout>
                                <Text variant="headingMd" as="h2">Text alignment</Text>
                                <FormLayout.Group>
                                    <Select 
                                        label="Page title and description"
                                        options={[
                                            { "label": "Left", "value": "left" },
                                            { "label": "Center", "value": "center" },
                                            { "label": "Right", "value": "right" }
                                        ]}
                                        {...align_page_text}
                                    />
                                    <Select 
                                        label="Grid title and price"
                                        options={[
                                            { "label": "Left", "value": "left" },
                                            { "label": "Center", "value": "center" },
                                            { "label": "Right", "value": "right" }
                                        ]}
                                        {...align_grid_text}
                                    />
                                </FormLayout.Group>
                            </FormLayout>
                        </Card.Section>

                        <Card.Section>
                            <FormLayout>
                                <Text variant="headingMd" as="h2">Grid</Text>
                                <FormLayout.Group>
                                    <Select
                                        label="Products per row in desktop"
                                        options={[
                                            { "label": "3", "value": "3" },
                                            { "label": "4", "value": "4" },
                                            { "label": "5", "value": "5" }
                                        ]}
                                        {...grid_size_desktop}
                                    />
                                    <Select
                                        label="Products per row in mobile"
                                        options={[
                                            { "label": "1", "value": "1" },
                                            { "label": "2", "value": "2" }
                                        ]}
                                        {...grid_size_mobile}
                                    />
                                    <RangeSelector
                                        label='Horizontal spacing'
                                        min={10}
                                        max={30}
                                        step={2}
                                        range={grid_x_spacing.value}
                                        changeRange={(value) => grid_x_spacing.onChange(value)}
                                    />
                                    <RangeSelector
                                        label='Vertical spacing'
                                        min={10}
                                        max={30}
                                        step={2}
                                        range={grid_y_spacing.value}
                                        changeRange={(value) => grid_y_spacing.onChange(value)}
                                    />
                                </FormLayout.Group>
                            </FormLayout>
                        </Card.Section>
                    </Card>
                </Layout.AnnotatedSection>

                <Layout.AnnotatedSection
                    id="content"
                    title="Page content"
                    description="Enter the wording of your choice in the corresponding field to personalise the text on your bundle page."
                >
                    <Card>
                        <Card.Section>
                            <FormLayout>
                                <Text variant="headingMd" as="h2">Product grid</Text>
                                <FormLayout.Group>
                                    <TextField 
                                        label="Add button"
                                        autoComplete="off"
                                        {...text_add}
                                    />
                                    <TextField 
                                        label="Sold out"
                                        autoComplete="off"
                                        {...text_soldout}
                                    />
                                </FormLayout.Group>
                            </FormLayout>
                        </Card.Section>

                        <Card.Section>
                            <FormLayout>
                                <Text variant="headingMd" as="h2">Price details</Text>
                                <FormLayout.Group>
                                    <TextField 
                                        label="Heading"
                                        autoComplete="off"
                                        {...text_price_heading}
                                    />
                                    <TextField 
                                        label="Checkout button"
                                        autoComplete="off"
                                        {...text_checkout}
                                    />
                                </FormLayout.Group>
                                <FormLayout.Group>
                                    <TextField 
                                        label="Save amount on order"
                                        autoComplete="off"
                                        helpText="[amount] will be replaced by the actual amount."
                                        {...text_save_amount}
                                    />
                                    <TextField 
                                        label="Minimum required to checkout"
                                        autoComplete="off"
                                        helpText="[amount] will be replaced by the required amount and [unit] will be replaced by either quantity or price based on selection."
                                        {...text_min_required}
                                    />
                                </FormLayout.Group>
                            </FormLayout>
                        </Card.Section>
                    </Card>
                </Layout.AnnotatedSection>
                <Layout.Section>
                    <PageActions
                        primaryAction={{
                            content: 'Save',
                            onClick: submit,
                            loading: submitting,
                            disabled: submitting || !dirty
                        }}
                    />
                </Layout.Section>
            </Layout>
        </Page>
    )
}