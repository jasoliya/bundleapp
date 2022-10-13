import { 
    Card,
    Page, 
    Layout,
    TextContainer,
    Heading
} from '@shopify/polaris';


export default function HomePage() {
    return (
        <Page narrowWidth>
            <Layout>
                <Layout.Section>
                    <Card sectioned>
                        <TextContainer spacing='loose'>
                            <Heading>Welcome</Heading>
                            <p>View summary of your bundle 🎉</p>
                        </TextContainer>                        
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    )
}