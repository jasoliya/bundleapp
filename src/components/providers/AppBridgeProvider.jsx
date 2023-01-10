import { useLocation, useNavigate } from 'react-router-dom';
import { Provider } from "@shopify/app-bridge-react"
import { useMemo } from 'react';

export function AppBridgeProvider({children}) {
    const location = useLocation();
    const navigate = useNavigate();
    const host = new URLSearchParams(location.search).get('host') || window.__SHOPIFY_DEV_HOST;
    window.__SHOPIFY_DEV_HOST = host;   

    const API_KEY = import.meta.env.VITE_SHOPIFY_API_KEY;

    const history = useMemo(
        () => ({
            replace: (path) => {
                navigate(path, {replace: true})
            },
        }),
        [navigate]
    );

    const routerConfig = useMemo(
        () => ({history, location}),
        [history, location]
    );

    const appConfig = {
        apiKey: API_KEY,
        host: host,
        forceRedirect: true
    }

    return (
        <Provider config={appConfig} router={routerConfig}>
            {children}
        </Provider>
    )
}