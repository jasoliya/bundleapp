import { Loading, TitleBar } from "@shopify/app-bridge-react";
import { Card, Layout, Page, SkeletonBodyText, SkeletonDisplayText, Stack, Thumbnail } from "@shopify/polaris";
import { useParams } from "react-router-dom";
import { ImageMajor } from "@shopify/polaris-icons";
import { useAppQuery } from "../../hooks";

export default function edit() {
    const { id } = useParams();
    const {
        data: bundle,
        isLoading,
        isRefetching
    } = useAppQuery({
        url: `/api/bundles/${id}`,
        reactQueryOptions: {
            refetchOnReconnect: false
        }
    })

    if(isLoading || isRefetching) {
        return (
            <Page>
                <TitleBar 
                    title="Bundle"
                    breadcrumbs={[{ content: 'Home', url: '/' }]}
                />
                <Loading />
                <Layout>
                    <Layout.Section>
                        <Card sectioned title="Title">
                            <SkeletonBodyText lines={2} />
                        </Card>
                        <Card sectioned title="Products">
                            <Stack spacing="loose" vertical>
                                <Stack vertical={false} alignment="center" key="1">
                                    <Stack.Item>
                                        <Thumbnail source={ImageMajor} />
                                    </Stack.Item>
                                    <Stack.Item fill>
                                        <SkeletonBodyText lines={1} />
                                    </Stack.Item>
                                </Stack>
                                <Stack vertical={false} alignment="center" key="2">
                                    <Stack.Item>
                                        <Thumbnail source={ImageMajor} />
                                    </Stack.Item>
                                    <Stack.Item fill>
                                        <SkeletonBodyText lines={1} />
                                    </Stack.Item>
                                </Stack>
                            </Stack>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        )
    }

    return (
        <Page>
            <TitleBar 
                title="Bundle"
                breadcrumbs={[{ content: 'Home', url: '/' }]}
            />
            
        </Page>
    )
}