import { TitleBar } from "@shopify/app-bridge-react";
import { Page } from "@shopify/polaris";
import { BundleForm } from "../../components";

export default function create() {
    return (
        <Page>
            <TitleBar 
                title="Create bundle"
                breadcrumbs={[{content: 'Home', url: '/'}]}
            />
            <BundleForm/>
        </Page>
    );
}