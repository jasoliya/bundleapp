import { useNavigate } from "@shopify/app-bridge-react";
import { Button, Card, Link, Page, SkeletonBodyText, SkeletonPage, Stack, Text, TextContainer } from "@shopify/polaris";
import { ExternalMinor } from '@shopify/polaris-icons';
import { useState } from "react";
import { useMedia } from '@shopify/react-hooks';
import { useShop } from "../components/providers/ShopProvider";

export default function indexPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(1);
    const isLargeScreen = useMedia('(min-width: 48em)');

    const { shop_name } = useShop();
    
    const date = new Date();
    const hrs = date.getHours();

    let greet;

    if (hrs < 12)
        greet = 'Good Morning';
    else if (hrs >= 12 && hrs <= 17)
        greet = 'Good Afternoon';
    else if (hrs >= 17 && hrs <= 24)
        greet = 'Good Evening';

    if(!shop_name) {
        return (
            <SkeletonPage>
                <Card sectioned>
                    <div className="shortLine">
                        <SkeletonBodyText lines="1"/>
                    </div>
                    <SkeletonBodyText lines="3"/>
                </Card>
                <Card sectioned>
                    <div className="shortLine">
                        <SkeletonBodyText lines="1"/>
                    </div>
                    <SkeletonBodyText lines="1"/>
                </Card>
                <Card sectioned>
                    <div className="shortLine">
                        <SkeletonBodyText lines="1"/>
                    </div>
                    <SkeletonBodyText lines="1"/>
                </Card>
            </SkeletonPage>
        )
    }
    
    return (
        <Page>
            <Stack vertical spacing={isLargeScreen ? 'extraLoose' : 'loose'}>
                <div className="indexHeader">
                    <TextContainer spacing={!isLargeScreen ? 'tight' : ''}>
                        <Text variant={isLargeScreen ? 'heading2xl' : 'headingXl'} as="h1">{shop_name ? `${greet}, ${shop_name}` : greet}</Text>
                        <Text variant={isLargeScreen ? 'bodyLg' : 'bodyMd'} as="p" color="subdued">Welcome to Bundle Page Creator</Text>
                    </TextContainer>
                </div>
                <Stack.Item>
                    <Card>
                        <Card.Section>
                            <TextContainer>
                                <Text variant="headingLg" as="h3">Setup instructions</Text>
                                <Text>Let's get started by following this guide</Text>
                            </TextContainer>
                        </Card.Section>
                        
                        <div className="tabYContainer">
                            <div className="tabPanel">
                                <ul>
                                    <li>
                                        <button className={activeTab === 1 ? 'selected' : ''} onClick={() => setActiveTab(1)}>
                                            <span className="tabCount">1</span>
                                            <span className="tabText">Create bundle</span>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={activeTab === 2 ? 'selected' : ''} onClick={() => setActiveTab(2)}>
                                            <span className="tabCount">2</span>
                                            <span className="tabText">Customize bundle</span>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={activeTab === 3 ? 'selected' : ''} onClick={() => setActiveTab(3)}>
                                            <span className="tabCount">3</span>
                                            <span className="tabText">Preview bundle</span>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={activeTab === 4 ? 'selected' : ''} onClick={() => setActiveTab(4)}>
                                            <span className="tabCount">4</span>
                                            <span className="tabText">Add a link</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div className="contentPanel">
                                <div className={`tabContent${activeTab === 1 ? ' active' : ''}`}>
                                    <Stack vertical>
                                        <Text variant="headingMd" as="h5">Create a bundle easily</Text>
                                        <Text>Create your bundle by filling in all necessary fields in the form.</Text>
                                        <Button primary onClick={() => navigate('/bundles/new')}>Create bundle</Button>
                                    </Stack>
                                </div>
                                <div className={`tabContent${activeTab === 2 ? ' active' : ''}`}>
                                    <Stack vertical>
                                        <Text variant="headingMd" as="h5">Customize appearance</Text>
                                        <Text>Customize the style and layout of the bundle page as per your requirements.</Text>
                                        <Button primary onClick={() => navigate('/settings')}>Customize</Button>
                                    </Stack>
                                </div>
                                <div className={`tabContent${activeTab === 3 ? ' active' : ''}`}>
                                    <Stack vertical>
                                        <Text variant="headingMd" as="h5">Check the preview</Text>
                                        <Text>Check the preview of your bundle page before adding a link to your storefront.</Text>
                                        <Button primary onClick={() => navigate('/bundles')}>Preview</Button>
                                    </Stack>
                                </div>
                                <div className={`tabContent${activeTab === 4 ? ' active' : ''}`}>
                                    <Stack vertical>
                                        <Text variant="headingMd" as="h5">Add a link to navigation</Text>
                                        <Text>Finally, After checking the preview, If everything meets your requirements, Add a link of the bundle page to a suitable place in your storefront.</Text>
                                    </Stack>
                                </div>
                            </div>
                        </div>
                    </Card>
                    <Card title="Have any questions?" sectioned>
                        <Text>If you have any questions, Check out the <Link external>documentation</Link> or write to us at <Link url="mailto:contact@codifyinfotech.com">contact@codifyinfotech.com</Link>.</Text>
                    </Card>
                    <Card title="Would you consider leaving us a review?" sectioned>
                        <Stack vertical>
                            <Text>We'd love to hear what you think. Your feedback would help us to improve the app.</Text>
                            <Button icon={ExternalMinor} url="https://google.com" external>Leave a review</Button>
                        </Stack>
                    </Card>
                </Stack.Item>
            </Stack>
        </Page>
    )
}