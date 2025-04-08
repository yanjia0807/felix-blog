import MapComponent from './map-container';
import { WebViewProvider } from '../../components/web-view';

function App() {
  return (
    <WebViewProvider>
      <div className="absolute h-full w-full">
        <MapComponent></MapComponent>
      </div>
    </WebViewProvider>
  );
}

export default App;
