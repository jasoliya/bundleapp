import { 
    Banner,
    Card,
    EmptyState,
    Page,
    SkeletonBodyText,
    SkeletonPage,
    Stack
} from '@shopify/polaris';
import { Loading, useNavigate } from '@shopify/app-bridge-react';
import placeholderImage from '../../assets/bundle-page-placeholder.png';
import { useAppQuery } from '../../hooks';
import { BundleIndex } from '../../components';
import { useState } from 'react';

export default function HomePage() {
    const navigate = useNavigate();
    const [ bundles, setBundles ] = useState([]);
    
    let {
        data,
        isLoading,
        isRefetching
    } = useAppQuery({
        url: '/api/bundles',
        reactQueryOptions: {
            onSuccess: (result) => {
                setBundles(result.data);
            }
        }
    });     

    const handleCallback = (data) => {
        setBundles(data);
    }
    
    const bundlesMarkup = bundles?.length ? (
        <BundleIndex bundleList={bundles} loading={isRefetching} parentCallback={handleCallback}  />
    ) : null;

    if(isLoading || isRefetching) {
        return (
            <SkeletonPage primaryAction>
                <Card sectioned>
                    <Loading />
                    <Stack vertical>
                        <SkeletonBodyText lines={1} />
                        <SkeletonBodyText lines={1} />
                    </Stack>
                </Card>
            </SkeletonPage>
        );
    }

    if (!isLoading && !isRefetching && bundles.length === 0) {
        return (
            <Page>
                <Card sectioned>
                    <EmptyState
                        heading='Create a bundle page'
                        action={{
                            content: 'Create page',
                            onAction: () => {
                                navigate('/bundles/new')
                            }
                        }}
                        image={placeholderImage}
                    >
                        <p>Create your bundle page and offer the best deals to customers.</p>
                    </EmptyState>
                </Card>
            </Page>
        );
    }    

    return (
        <Page
            title='Bundles'
            primaryAction={{
                content: 'Create page',
                disabled: bundles.length >= 10,
                onAction: () => navigate('/bundles/new')
            }}
        >
            <Stack vertical spacing='loose'>
                {bundles.length >= 10 && (
                    <Banner
                        title='Bundle page limit reached'
                        status='warning'
                    >
                        <p>You can create a maximum of 10 bundle pages. Remove the unused page to add more.</p>
                    </Banner>
                )}
                {bundlesMarkup}
            </Stack>
        </Page>
    );
}