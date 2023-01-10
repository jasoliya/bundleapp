import { useNavigate } from "@shopify/app-bridge-react";
import { FooterHelp, Frame, Link, Navigation, TopBar } from "@shopify/polaris";
import {
    HomeMinor,
    GiftCardMinor,
    SettingsMinor,
    QuestionMarkMinor
} from '@shopify/polaris-icons';
import { useLocation } from 'react-router-dom';
import { useState, useCallback } from "react";
import { useMedia } from '@shopify/react-hooks';

export default function FrameContainer({ children }) {
    const [mobileNavActive, setMobileNavActive] = useState(false);

    const navigate = useNavigate();
    const { pathname } = useLocation();
    const isLargeScreen = useMedia('(min-width: 48em)');

    const isBundlePage = pathname.match(/^\/bundles\/(new|[0-9]+)$/);

    const toggleMobileNavigationActive = useCallback(
        () => setMobileNavActive(
            (mobileNavActive) => !mobileNavActive
        ),
        []
    );

    const topBarMarkup = !isLargeScreen ? (
        <TopBar 
            showNavigationToggle
            onNavigationToggle={toggleMobileNavigationActive}
        />
    ) : null;
    
    const navigationMarkup = (
        <Navigation location={pathname}>
            <Navigation.Section
                items={[
                    {
                        label: 'Home',
                        icon: HomeMinor,
                        url: '/',
                        exactMatch: true,
                        onClick: () => navigate('/')
                    },
                    {
                        label: 'Bundles',
                        icon: GiftCardMinor,
                        url: '/bundles',
                        exactMatch: true,
                        onClick: () => navigate('/bundles')
                    },
                    {
                        label: 'Settings',
                        icon: SettingsMinor,
                        url: '/settings',
                        exactMatch: true,
                        onClick: () => navigate('/settings')
                    },
                    {
                        label: 'Help',
                        icon: QuestionMarkMinor,
                        url: '/help',
                        exactMatch: true,
                        onClick: () => navigate('/help')
                    }
                ]}
            />
        </Navigation>
    )

    return (
        <Frame 
            navigation={navigationMarkup}
            topBar={topBarMarkup}
            showMobileNavigation={mobileNavActive}
            onNavigationDismiss={toggleMobileNavigationActive}
        >
            {children}

            {!isBundlePage && pathname !== '/' && pathname !== '/help' && (
                <FooterHelp>Need help? Check out the <Link external>documentation</Link>.</FooterHelp>
            )}
        </Frame>
    )
}