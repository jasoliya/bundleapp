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
import emptyImage from '../../assets/empty-bundles.png';
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
            onSuccess: (data) => {
                setBundles(data);
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
                        heading='Create your bundle'
                        action={{
                            content: 'Create bundle',
                            onAction: () => {
                                navigate('/bundles/new')
                            }
                        }}
                        image={emptyImage}
                    >
                        <p>Create your bundle and offer best deals to customer.</p>
                    </EmptyState>
                </Card>
            </Page>
        );
    }    

    return (
        <Page
            title='Bundles'
            primaryAction={{
                content: 'Create bundle',
                disabled: bundles.length >= 10,
                onAction: () => navigate('/bundles/new')
            }}
        >
            <Stack vertical spacing='loose'>
                {bundles.length >= 10 && (
                    <Banner
                        title='Bundle limit reached'
                        status='warning'
                    >
                        <p>You can create a maximum of 10 bundles. Remove unused bundle to add more.</p>
                    </Banner>
                )}
                {bundlesMarkup}
            </Stack>
        </Page>
    );
}