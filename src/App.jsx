import { BrowserRouter } from 'react-router-dom';
import { AppBridgeProvider, ChatProvider, PolarisProvider, QueryProvider, ShopProvider } from './components';
import Routes from './Routes';
import "@shopify/polaris/build/esm/styles.css";
import "./assets/styles.css";
import FrameContainer from './components/FrameContainer';

function App() {
  const pages = import.meta.globEager("./pages/**/*.([jt]sx)");
  
  return (
    <BrowserRouter>
      <PolarisProvider>
        <AppBridgeProvider>
          <QueryProvider>
            <ShopProvider>
              <ChatProvider>
                <FrameContainer>
                  <Routes pages={pages}/>
                </FrameContainer>
              </ChatProvider>
            </ShopProvider>
          </QueryProvider>
        </AppBridgeProvider>
      </PolarisProvider>
    </BrowserRouter>
  )
}

export default App
