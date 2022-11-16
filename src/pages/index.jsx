import { 
    Card,
    EmptyState,
    Frame,
    Page,
    SkeletonBodyText
} from '@shopify/polaris';
import { Loading, TitleBar, useNavigate } from '@shopify/app-bridge-react';
import emptyImage from '../assets/emptystate-files.png';
import { useAppQuery } from '../hooks';
import { BundleIndex } from '../components';
import { useState } from 'react';

export default function HomePage() {
    const navigate = useNavigate();
    const [ bundles, setBundles ] = useState([]);
    
    let {
        data,
        isLoading,
        isRefetching,
        isSuccess
    } = useAppQuery({
        url: '/api/bundles',
        reactQueryOptions: {
            onSuccess: (data) => {
                setBundles(data);
            }
        }
    });     

    const primaryAction = {
        content: 'Create bundle',
        url: '/bundles/new'
    }

    const loadingMarkup = isLoading ? (
        <Frame>
            <Card sectioned>
                <Loading />
                <SkeletonBodyText />
            </Card>
        </Frame>
    ) : null;
    
    const emptyStateMarkup =
        isSuccess && !bundles?.length ? (
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
                    <p>Create your bundle and offer best deals to customer</p>
                </EmptyState>
            </Card>
        ) : null;

    const handleCallback = (data) => {
        setBundles(data);
    }
    
    const bundlesMarkup = bundles?.length ? (
        <BundleIndex bundleList={bundles} loading={isRefetching} parentCallback={handleCallback}  />
    ) : null;

    return (
        <Page>
            <TitleBar 
                title='Home'
                primaryAction={primaryAction}
            />
            {loadingMarkup}
            {bundlesMarkup}
            {emptyStateMarkup}
        </Page>
    );
}