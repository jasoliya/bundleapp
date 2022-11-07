import { BrowserRouter } from 'react-router-dom';
import { AppBridgeProvider, PolarisProvider, QueryProvider } from './components';
import Routes from './Routes';
import "@shopify/polaris/build/esm/styles.css";
import "./assets/styles.css";

function App() {
  const pages = import.meta.globEager("./pages/**/*.([jt]sx)");
  
  return (
    <BrowserRouter>
      <PolarisProvider>
        <AppBridgeProvider>
          <QueryProvider>
            <Routes pages={pages}/>
          </QueryProvider>
        </AppBridgeProvider>
      </PolarisProvider>
    </BrowserRouter>
  )
}

export default App
