import { useCallback, useRef, createContext, useContext, useMemo, useState } from 'react';
import TawkMessengerReact from '@tawk.to/tawk-messenger-react';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
    const tawkMessangerRef = useRef();
    
    const openChat = useCallback(() => tawkMessangerRef.current.maximize(), []);
    
    const contextValue = useMemo(() => {
        return {
            openChat
        }
    }, []);

    return (
        <ChatContext.Provider value={contextValue}>
            {children}

            <TawkMessengerReact 
                propertyId="5dc17d4fe4c2fa4b6bda17b7"
                widgetId="default"
                ref={tawkMessangerRef}
            />
        </ChatContext.Provider>
    )
}

export function useChat() {
    return useContext(ChatContext);
}