import React, { useEffect, useState } from 'react'
import { ApiCall, GetApiCall } from '../helper/axios';
import { getCookie, setCookie } from '../helper/commonFunction';
import { config_variable } from '../helper/commonApi';

const HeaderRewardPoints = () => {
    const [pointsdata, Setpointsdata] = useState()
    const [voucherCountData, setVoucherCountData] = useState(getCookie("vouchercount"));

    const generateToken = async () => {
        const res = await ApiCall('POST', '/generate-token', { shop: config_variable.shop_name })
        if (res.data.status === 'success' && res.data.statusCode === 200) {
            const { token } = res?.data?.data;
            const expirationHours = 24;
            setCookie("access_token", token, expirationHours);
            if (!getCookie("vouchercount")) {
                getMyVouchers(token)
            }
            getuserbalance(token)
        }
    }

    const getuserbalance = async (token) => {
        // eslint-disable-next-line no-undef
        if (window?.__st?.cid && customer_card_number) {
            const data = {
                // eslint-disable-next-line no-undef
                cardNo: customer_card_number
            }
            const res = await ApiCall('POST', '/get_user_balance', data, { authentication: token }, '1')
            if (res.data.status === 'SUCCESS' && res.status === 200) {
                const balance = res.data.data.balance
                Setpointsdata(res.data.data)
                if (getCookie("vouchercount")) {
                    setVoucherCountData(getCookie("vouchercount"));
                }
                setCookie("balance", balance, 0)
            }
        }
    }
    useEffect(() => {
        if (getCookie('access_token')) {
            getuserbalance(getCookie('access_token'));
            if (!getCookie("vouchercount")) {
                getMyVouchers(getCookie('access_token'))
            }
        } else {
            generateToken();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (pointsdata && (voucherCountData || parseInt(voucherCountData) === 0)) {
            if (document.querySelector('.header-advanced-icons .header-points-voucher-container.header-advanced-cart')) {
                document.querySelector('.header-advanced-icons .header-points-voucher-container.header-advanced-cart').classList.remove('is-loading');
            }
        }
    }, [voucherCountData, pointsdata])

    const getMyVouchers = async (token) => {
        // eslint-disable-next-line no-undef
        if (window?.__st?.cid && customer_card_number) {
            const data = {
                customerId: window?.__st?.cid,
                // eslint-disable-next-line no-undef
                cardNo: customer_card_number
            }
            const res = await ApiCall('POST', '/get_my_voucher_List', data, { authentication: token }, '1');
            if (res.data.status === 'SUCCESS' && res.status === 200) {
                const vouchercount = res.data.data.count
                setCookie("vouchercount", vouchercount, 0)
                setVoucherCountData(vouchercount);
            }
        }
    }

    return (
        <>
            <a href='https://aapharmacy.com.my/account#my_points' className='my-reward-points'><b>Points: {pointsdata && pointsdata?.balance ? pointsdata?.balance : 0}</b></a>
            <a className='my-reward-points' href='https://aapharmacy.com.my/pages/view-all-voucher'><b>Vouchers: {voucherCountData ? voucherCountData : 0}</b></a>
        </>
    )
}

export default HeaderRewardPoints