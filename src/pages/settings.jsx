import { Card, Layout, Page, SkeletonBodyText, SkeletonDisplayText, TextContainer } from "@shopify/polaris";
import { SettingsForm } from "../components/SettingsForm";
import { useAppQuery } from "../hooks";

export default function settings() {
    const {
        data,
        isLoading,
        isRefetching
    } = useAppQuery({
        url: '/api/settings',
        reactQueryOptions: {
            refetchOnReconnect: false
        }
    });

    if(isLoading || isRefetching) {
        return (
            <Page title="Settings">
                <Layout>
                    <Layout.AnnotatedSection
                        id="design"
                        title={<SkeletonDisplayText size="small" />}
                        description={<SkeletonBodyText lines={2} />}
                    >
                        <Card sectioned>
                            <TextContainer>
                                <SkeletonDisplayText size="small" />
                                <div>
                                    <SkeletonBodyText lines={2} />
                                </div>
                                <SkeletonDisplayText size="small" />
                                <div>
                                    <SkeletonBodyText lines={2} />
                                </div>
                                <SkeletonDisplayText size="small" />
                                <div>
                                    <SkeletonBodyText lines={2} />
                                </div>
                            </TextContainer>
                        </Card>
                    </Layout.AnnotatedSection>

                    <Layout.AnnotatedSection
                        id="layout"
                        title={<SkeletonDisplayText size="small" />}
                        description={<SkeletonBodyText lines={2} />}
                    >
                        <Card sectioned>
                            <TextContainer>
                                <SkeletonDisplayText size="small" />
                                <div>
                                    <SkeletonBodyText lines={2} />
                                </div>
                                <SkeletonDisplayText size="small" />
                                <div>
                                    <SkeletonBodyText lines={2} />
                                </div>
                            </TextContainer>
                        </Card>
                    </Layout.AnnotatedSection>

                    <Layout.AnnotatedSection
                        id="content"
                        title={<SkeletonDisplayText size="small" />}
                        description={<SkeletonBodyText lines={2} />}
                    >
                        <Card sectioned>
                            <TextContainer>
                                <SkeletonDisplayText size="small" />
                                <div>
                                    <SkeletonBodyText lines={2} />
                                </div>
                                <SkeletonDisplayText size="small" />
                                <div>
                                    <SkeletonBodyText lines={2} />
                                </div>
                            </TextContainer>
                        </Card>
                    </Layout.AnnotatedSection>
                </Layout>
            </Page>
        )
    }

    return (
        <SettingsForm settings={data} />
    )
}