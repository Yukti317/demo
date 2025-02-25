import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import Store from './redux';
import AaPharmacyFront from './pages/AaPharmacyFront';
import FrontRewardCart from './pages/FrontRewardCart';
import FrontVoucherList from './pages/FrontVoucherList';
import HeaderRewardPoints from './pages/HeaderRewardPoints';
import { AppProvider, Frame, Spinner } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import RewardWidget from './pages/widget/RewardWidget';

const BootstrapTheme = React.lazy(() => import('./pages/Bootstrap'));

const Bootstrap = ({ children }) => {
  return (
    <>
      <React.Suspense fallback={<div className='page-loader'><Spinner size="large" /></div>}>
        <BootstrapTheme />
      </React.Suspense>
      <React.Suspense fallback={<div className='page-loader'><Spinner size="large" /></div>}>
        {children}
      </React.Suspense>
    </>
  )
}

try {
  if (window?.Shopify?.shop === 'aapharmacy.myshopify.com' && window?.Shopify?.theme?.id) {
    if (window?.__st?.pageurl.includes('aapharmacy.com.my/')) {
      const script = document.querySelector('.header-points-voucher-container');
      if (script) {
        let root = ReactDOM.createRoot(script);
        root.render(
          window?.__st?.cid ? <HeaderRewardPoints /> : <></>
        );
      }
      const widgetPopup = document.querySelector('.reward-widget-popup');
      if (widgetPopup) {
        let root = ReactDOM.createRoot(widgetPopup);
        root.render(
          <>
            <RewardWidget />
          </>
        );
      }
    }
    if (window?.__st?.pageurl?.includes('/products/')) {
      const script = document.querySelector('.product-reward-point-show');
      if (script) {
        let root = ReactDOM.createRoot(script);
        root.render(
          <AaPharmacyFront pageurl="product-page" />
        );
      }
    } else if (window.location.pathname === '/' || window?.__st?.pageurl?.includes('/collections/')) {
      const divElement = document.createElement('div');
      divElement.id = 'reward-point-content-element'
      document.body.appendChild(divElement);
      const root = ReactDOM.createRoot(divElement);
      root.render(
        <AaPharmacyFront pageurl="Home" />
      );
    } else if (window?.__st?.pageurl?.includes('/cart')) {
      const scriptElement = document.createElement('script');
      const script = document.querySelector('.total-reward-points-cart-page');
      if (script) {
        script.appendChild(scriptElement);
        let root = ReactDOM.createRoot(scriptElement);
        root.render(
          <FrontRewardCart />
        );
      }
    } else if (window?.__st?.pageurl?.includes('/view-all-voucher')) {
      const script = document.querySelector('#voucher-page-content');
      if (script) {
        let root = ReactDOM.createRoot(script);
        root.render(
          <AppProvider i18n={enTranslations}>
            <Frame>
              <FrontVoucherList />
            </Frame>
          </AppProvider>
        );
      }
    }
  } else {
    try {
      if (document.getElementById('root')) {
        let root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(
          <Provider store={Store}>
            <Bootstrap>
              <App />
            </Bootstrap>
          </Provider>
        );
      }
    } catch (error) {
      console.log('error', error);
    }
  }
} catch (error) {
  console.error('error', error);
}