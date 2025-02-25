import React, { useMemo } from 'react';
import Dashboard from '../pages/Dashboard';
import RedeemPoints from '../pages/redeem_points';
import { NavigationMenu, Provider, RoutePropagator } from '@shopify/app-bridge-react';
import { Frame, AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { useLocation, Outlet } from 'react-router-dom';
import { config_variable } from '../helper/commonApi';
import FixedAmountDiscount from '../pages/redeem_points/FixedAmountDiscount';
import IncrementalAmountDiscount from '../pages/redeem_points/IncrementalAmountDiscount';
import PercentageOff from '../pages/redeem_points/PercentageOff';
import FreeShipping from '../pages/redeem_points/FreeShipping';
import FreeProduct from '../pages/redeem_points/FreeProduct';
import { useDispatch } from 'react-redux';
import { generateToken } from '../redux/slice/commonSlice';
import Earnpoints from '../pages/Earn_points/Earnpoints';
import Placeanorder from '../pages/Earn_points/Placeanorder';
import Signup from '../pages/Earn_points/Signup';
import RewardsList from '../pages/redeem_points/RewardsList';
import Viewallpoints from '../pages/Earn_points/Viewallpoints';
import VoucherList from '../pages/vouchers/VoucherList';
import AddVoucher from '../pages/vouchers/AddVoucher';

export function Router() {
    const location = useLocation();
    const dispatch = useDispatch();

    useMemo(async () => {
        await dispatch(generateToken()).unwrap();
    }, []);

    if (!config_variable.config.host) {
        config_variable.config.host = location?.state?.config?.host ? location?.state?.config?.host : config_variable.config.host;
        config_variable.shop_name = location?.state?.shop_name ? location?.state?.shop_name : config_variable.shop_name;
    }

    return (
        <>
            <div>
                <AppProvider i18n={enTranslations}>
                    {process.env?.MODE && process.env?.MODE !== 'local' && !config_variable?.shop_url.includes('aapharmacy.com.my') ? <Provider config={config_variable.config}>
                        <NavigationMenu
                            navigationLinks={[
                                {
                                    label: 'Earn points',
                                    destination: '/'
                                },
                                {
                                    label: 'Redeem points',
                                    destination: '/redeem-points'
                                },
                                {
                                    label: 'Voucher',
                                    destination: '/voucher'
                                },
                            ]}
                            matcher={(link, location) => link.destination === location.pathname} />
                        <Frame>
                            <RoutePropagator location={location} />
                            <Outlet />
                        </Frame>
                    </Provider> : <Outlet />
                    }
                </AppProvider>
            </div>
        </>
    );
}

export const routes = [
    { path: '/', component: <Earnpoints /> },
    { path: '/reward-list', component: <RewardsList /> },
    { path: '/redeem-points', component: <RedeemPoints /> },
    { path: '/redeem-points/fixed-amount-discount', component: <FixedAmountDiscount /> },
    { path: '/redeem-points/increment-amount-discount', component: <IncrementalAmountDiscount /> },
    { path: '/redeem-points/percentage-off', component: <PercentageOff /> },
    { path: '/redeem-points/free-shipping', component: <FreeShipping /> },
    { path: '/redeem-points/free-product', component: <FreeProduct /> },

    { path: '/redeem-points/fixed-amount-discount/:id', component: <FixedAmountDiscount /> },
    { path: '/redeem-points/increment-amount-discount/:id', component: <IncrementalAmountDiscount /> },
    { path: '/redeem-points/percentage-off/:id', component: <PercentageOff /> },
    { path: '/redeem-points/free-shipping/:id', component: <FreeShipping /> },
    { path: '/redeem-points/free-product/:id', component: <FreeProduct /> },

    { path: '/earnpoints', component: <Earnpoints/> },
    { path: '/earnpoints/placeorder', component: <Placeanorder/> },
    { path: '/earnpoints/placeorder/:order_id', component: <Placeanorder/> },
    { path: '/earnpoints/signup', component: <Signup/> },
    { path: '/earnpoints/signup/:signup_id', component: <Signup/> },
    { path: '/earnpoints/viewallpoints', component: <Viewallpoints/> },

    { path: '/voucher', component: <VoucherList /> },
    { path: '/voucher/add-voucher', component: <AddVoucher /> },
    { path: '/voucher/add-voucher/:voucher_id', component: <AddVoucher /> }
];
