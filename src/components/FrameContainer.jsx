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
        <Navigation location="/">
            <Navigation.Section
                items={[
                    {
                        label: 'Home',
                        icon: HomeMinor,
                        selected: pathname === '/',
                        onClick: () => navigate('/')
                    },
                    {
                        label: 'Bundles',
                        icon: GiftCardMinor,
                        selected: pathname.indexOf('bundles') >= 0,
                        onClick: () => navigate('/bundles')
                    },
                    {
                        label: 'Settings',
                        icon: SettingsMinor,
                        selected: pathname.indexOf('settings') >= 0,
                        onClick: () => navigate('/settings')
                    },
                    {
                        label: 'Help',
                        icon: QuestionMarkMinor,
                        selected: pathname.indexOf('/help') >= 0,
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