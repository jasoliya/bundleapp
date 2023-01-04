import { useState, createContext, useContext } from "react";
import { useAppQuery } from "../../hooks";

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
    const [ shop, setShop ] = useState({});

    useAppQuery({
        url:'/api/dashboard',
        reactQueryOptions: {
            onSuccess: (data) => {
                setShop({...data});
            }
        }
    });

    return (
        <ShopContext.Provider value={shop}>
            {children}
        </ShopContext.Provider>
    )
}

export function useShop() {
    return useContext(ShopContext);
}