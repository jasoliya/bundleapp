import { ContextualSaveBar, useToast } from "@shopify/app-bridge-react";
import { Card, FormLayout, Layout, Page, PageActions, RadioButton, Select, Stack, Text, TextField } from "@shopify/polaris";
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
            button_corner_radius,
            button_font_size,
            button_back_color,
            button_text_color,
            button_hover_back_color,
            button_hover_text_color,
            page_width,
            grid_size_desktop,
            grid_size_mobile,
            grid_x_spacing,
            grid_y_spacing
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
            button_corner_radius: useField(settings?.button_corner_radius || 4),
            button_font_size: useField(settings?.button_font_size || 16),
            button_back_color: useField(settings?.button_back_color || '#ffffff'),
            button_text_color: useField(settings?.button_text_color || '#000000'),
            button_hover_back_color: useField(settings?.button_hover_back_color || '#000000'),
            button_hover_text_color: useField(settings?.button_hover_text_color || '#ffffff'),
            page_width: useField({
                value: settings?.page_width || '1400',
                validates: [notEmptyString('Please enter page width')]
            }),
            grid_size_desktop: useField(settings?.grid_size_desktop || '4'),
            grid_size_mobile: useField(settings?.grid_size_mobile || '1'),
            grid_x_spacing: useField(settings?.grid_x_spacing || 16),
            grid_y_spacing: useField(settings?.grid_y_spacing || 16)
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

    const [pageWidth, setPageWidth] = useState(page_width.value !== 'full' ? page_width.value : '1400');

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
                    description="Basic customization will allow you to change the font size, color and button style."
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
                            <FormLayout>
                                <Text variant="headingMd" as="h2">Buttons</Text>
                                <FormLayout.Group>
                                    <RangeSelector
                                        label='Corner radius'
                                        min={2}
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