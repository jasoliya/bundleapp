import { 
    Card,
    EmptyState,
    IndexTable,
    Page,
    SkeletonBodyText,
    TextStyle
} from '@shopify/polaris';
import { Loading, TitleBar, useNavigate } from '@shopify/app-bridge-react';
import emptyImage from '../assets/emptystate-files.png';
import { useAppQuery } from '../hooks';
import { BundleIndex } from '../components';
import { useState } from 'react';

export default function HomePage() {
    const navigate = useNavigate();
    const [ changedList, setChangedList ] = useState([]);
    
    const {
        data: bundles,
        isLoading,
        isRefetching
    } = useAppQuery({
        url: '/api/bundles'
    });

    const primaryAction = {
        content: 'Create bundle',
        url: '/bundles/new'
    }

    const loadingMarkup = isLoading ? (
        <Card sectioned>
            <Loading />
            <SkeletonBodyText />
        </Card>
    ) : null;
    
    const emptyStateMarkup =
        !isLoading && !bundles?.length ? (
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

    const handleCallback = (_bundles) => {
        setChangedList(_bundles);
    }
    
    const bundlesMarkup = bundles?.length ? (
        <BundleIndex bundleList={changedList.length ? changedList : bundles} loading={isRefetching} parentCallback={handleCallback}  />
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