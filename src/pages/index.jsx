import { 
    Card,
    EmptyState,
    Page
} from '@shopify/polaris';
import { TitleBar, useNavigate } from '@shopify/app-bridge-react';
import emptyImage from '../assets/emptystate-files.png';

export default function HomePage() {
    const navigate = useNavigate();

    const primaryAction = {
        content: 'Create bundle',
        url: '/new'
    }

    return (
        <Page>
            <TitleBar 
                title='Home'
                primaryAction={primaryAction}
            />
            <Card sectioned>
                <EmptyState
                    heading='Create your bundle'
                    action={{
                        content: 'Create bundle',
                        onAction: () => {
                            navigate('/new')
                        }
                    }}
                    image={emptyImage}
                >
                    <p>Create your bundle and offer best deals to customer</p>
                </EmptyState>
            </Card>
        </Page>
    )
}