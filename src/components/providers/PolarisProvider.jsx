import { AppProvider } from '@shopify/polaris';
import { useNavigate } from '@shopify/app-bridge-react';
import translations from '@shopify/polaris/locales/en.json';
import { useCallback } from 'react';

function AppBridgeLink({ url, children, external, ...rest }) {
    const navigate = useNavigate();
    const handleClick = useCallback(() => {
        navigate(url);
    }, [url]);

    const IS_EXTERNAL_LINK_REGEX = /^(?:[a-z][a-z\d+.-]*:|\/\/)/;

    if(external || IS_EXTERNAL_LINK_REGEX.test(url)) {
        return (
            <a target='_blank' rel='noopener noreferer' href={url} {...rest}>
                {children}
            </a>
        );
    }

    return (
        <a onClick={handleClick} {...rest}>
            {children}
        </a>
    )
}

export function PolarisProvider({children}) {
    return (
        <AppProvider i18n={translations} linkComponent={AppBridgeLink}>
            {children}
        </AppProvider>
    )
}