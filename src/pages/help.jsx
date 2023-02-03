import { Button, Card, Icon, Layout, Link, Page, Stack, Text } from "@shopify/polaris";
import { ChatMajor, EmailMajor } from '@shopify/polaris-icons';
import { useChat } from "../components/providers/ChatProvider";

export default function help() {
    const {openChat} = useChat();
    
    return (
        <Page>
            <Layout>
                <Layout.AnnotatedSection
                    id="help"
                    title="Need help?"
                    description={<Text>If you have any queries or encounter any problems, Please refer to the <Link url="https://apps.codifyinfotech.com/" external>documentation</Link> or contact our support team.</Text>}
                >
                    <Card sectioned>
                        <Stack spacing="loose" vertical>
                            <Text variant="headingMd" as="h2">Available: Monday - Friday, 10am to 7pm IST</Text>
                            <Stack alignment="center" wrap={false}>
                                <Stack vertical>
                                    <Icon color="primary" source={ChatMajor} />
                                    <Button onClick={() => openChat()}>Let's chat</Button>
                                </Stack>
                                <Text as="span" color="subdued">OR</Text>
                                <Stack vertical>
                                    <Icon color="primary" source={EmailMajor} />
                                    <Button url="mailto:contact@codifyinfotech.com">Send an email</Button>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Card>
                </Layout.AnnotatedSection>
            </Layout>
        </Page>
    )
}