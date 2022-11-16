import { TitleBar } from "@shopify/app-bridge-react";
import { Frame } from "@shopify/polaris";
import { BundleForm } from "../../components";

export default function create() {
    return (
        <Frame>
            <TitleBar 
                title="Create bundle"
                breadcrumbs={[{content: 'Home', url: '/'}]}
            />
            <BundleForm/>
        </Frame>
    );
}