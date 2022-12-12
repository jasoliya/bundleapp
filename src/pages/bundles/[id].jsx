import { Loading } from "@shopify/app-bridge-react";
import { Card, Layout, SkeletonBodyText, SkeletonPage } from "@shopify/polaris";
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
            <SkeletonPage>
                <Loading />
                <Layout>
                    <Layout.Section>
                        <Card sectioned>
                            <SkeletonBodyText lines={3} />
                        </Card>
                        <Card sectioned>
                            <SkeletonBodyText lines={3} />
                        </Card>
                        <Card sectioned>
                            <SkeletonBodyText lines={3} />
                        </Card>
                    </Layout.Section>
                    <Layout.Section secondary>
                        <Card sectioned>
                            <SkeletonBodyText lines={2} />
                        </Card>
                        <Card sectioned>
                            <SkeletonBodyText lines={2} />
                        </Card>
                        <Card sectioned>
                            <SkeletonBodyText lines={2} />
                        </Card>
                    </Layout.Section>
                </Layout>
            </SkeletonPage>
        )
    }

    return (
        <BundleForm Bundle={Bundle} />
    )
}