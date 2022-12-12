import { BrowserRouter } from 'react-router-dom';
import { AppBridgeProvider, PolarisProvider, QueryProvider } from './components';
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
            <FrameContainer>
              <Routes pages={pages}/>
            </FrameContainer>
          </QueryProvider>
        </AppBridgeProvider>
      </PolarisProvider>
    </BrowserRouter>
  )
}

export default App
