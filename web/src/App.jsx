import { BrowserRouter } from 'react-router-dom';
import { AppBridgeProvider } from './components';
import { PolarisProvider } from './components';
import Routes from './Routes';
import "@shopify/polaris/build/esm/styles.css";

function App() {
  const pages = import.meta.globEager("./pages/**/*.([jt]sx)");
  
  return (
    <BrowserRouter>
      <PolarisProvider>
        <AppBridgeProvider>
          <Routes pages={pages}/>
        </AppBridgeProvider>
      </PolarisProvider>
    </BrowserRouter>
  )
}

export default App
