import { Card, EmptyState, Page } from "@shopify/polaris";
import exclamation from '../assets/exclamation-mark.svg';

export default function notFound() {
    return (
        <Page>
            <Card sectioned>
                <EmptyState
                    heading="There's no page at this address"
                    image={exclamation}
                >
                    <p>Check the URL and try again.</p>
                </EmptyState>
            </Card>        
        </Page>
    );
}