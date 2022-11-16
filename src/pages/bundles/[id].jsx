import { Loading, TitleBar } from "@shopify/app-bridge-react";
import { Card, Frame, Layout, Page, SkeletonBodyText, SkeletonDisplayText, Stack, Thumbnail } from "@shopify/polaris";
import { useParams } from "react-router-dom";
import { useAppQuery } from "../../hooks";
import { BundleForm } from "../../components";

export default function edit() {
    const { id } = useParams();
    const {
        data: Bundle,
        isLoading,
        isRefetching
    } = useAppQuery({
        url: `/api/bundles/${id}`,
        reactQueryOptions: {
            refetchOnReconnect: false
        }
    });

    if(isLoading || isRefetching) {
        return (
            <Page>
                <TitleBar 
                    title="Bundle"
                    breadcrumbs={[{ content: 'Home', url: '/' }]}
                />
                <Loading />
                <Stack vertical spacing="loose">
                    <SkeletonDisplayText size="medium" />
                    <Frame>
                        <Layout>
                            <Layout.Section>
                                <Card sectioned>
                                    <SkeletonBodyText lines={2} />
                                </Card>
                                <Card sectioned>
                                    <Stack spacing="loose" vertical>
                                        <Stack.Item fill>
                                            <SkeletonBodyText lines={2} />
                                        </Stack.Item>
                                        <Stack.Item fill>
                                            <SkeletonBodyText lines={2} />
                                        </Stack.Item>
                                    </Stack>
                                </Card>
                            </Layout.Section>
                            <Layout.Section secondary>
                                <Card sectioned>
                                    <SkeletonBodyText lines={2} />
                                </Card>
                            </Layout.Section>
                        </Layout>
                    </Frame>
                </Stack>
            </Page>
        )
    }

    return (
        <Frame>
            <TitleBar 
                title="Bundle"
                breadcrumbs={[{ content: 'Home', url: '/' }]}
            />
            <BundleForm Bundle={Bundle} />
        </Frame>
    )
}