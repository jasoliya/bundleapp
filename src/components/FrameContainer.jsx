import { useNavigate } from "@shopify/app-bridge-react";
import { Frame, Navigation } from "@shopify/polaris";
import {
    GiftCardMinor,
    SettingsMinor
} from '@shopify/polaris-icons';
import { useLocation } from 'react-router-dom';

export default function FrameContainer({ children }) {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    
    const navigationMarkup = (
        <Navigation location="/">
            <Navigation.Section
                items={[
                    {
                        label: 'Bundles',
                        icon: GiftCardMinor,
                        selected: pathname.indexOf('bundles/settings') === -1,
                        onClick: () => navigate('/')
                    },
                    {
                        label: 'Settings',
                        icon: SettingsMinor,
                        selected: pathname.indexOf('bundles/settings') >= 0,
                        onClick: () => navigate('/bundles/settings')
                    }
                ]}
            />
        </Navigation>
    )

    return (
        <Frame navigation={navigationMarkup}>
            {children}
        </Frame>
    )
}