/* eslint-disable no-undef */
import React, { useState } from 'react'
import { ToastContainer } from 'react-toastify'
import Titlebanner from './Titlebanner'
import freeproduct from '../../assets/img/place_order.png'
import Freeproductvoucher from './Freeproductvoucher'
import { ApiCall } from '../../helper/axios'
import { getCookie, setCookie } from '../../helper/commonFunction'
import { config_variable } from '../../helper/commonApi'
function Freeproductwidget({ pointcost, redeemid, redeemused, producttitle, redeemtitle, getredeemlist, rewardlist }) {
    const [loader, setLoader] = useState(false)
    const [popup, setPopup] = useState(false)
    const [redeemvoucher, setRedeemvoucher] = useState('')
    const [producthandle, setProducthandle] = useState('')
    const [message, setMessage] = useState('')
    const [redeemdata, setreemdata] = useState({
        redeemid: 0,
        redeemused: false,
    })
    const generateToken = async (flag) => {
        const res = await ApiCall('POST', '/generate-token', { shop: config_variable.shop_name })
        if (res.data.status === 'success' && res.data.statusCode === 200) {
            const { token } = res?.data?.data;
            const expirationHours = 24;
            setCookie("access_token", token, expirationHours);
            if (flag) {
                redeemvouchercode(token);
            }
        }
    }

    const redeemvouchercode = async (token) => {
        setLoader(true)
        setPopup(false)
        const data = {
            id: redeemid,
            repeat_status: !redeemused ? 1 : 2,
            customerId: `${window?.__st?.cid}`,
            cardNo: `${customer_card_number}`,
        }
        const res = await ApiCall('POST', '/redeem_voucher_code', data, { authentication: token }, '1')
        if (res.data.message === 'your point is not enough for this redeem') {
            setMessage(res.data.message)
            setLoader(false)
            setPopup(false);
        }
        if (res.status === 200) {
            if (getCookie('balance')) {
                let newBalance = (parseInt(getCookie('balance')) - res.data.data.cardPoints);
                if (document.querySelector('.aapharamcy-member-signin.current-balance b')) {
                    document.querySelector('.aapharamcy-member-signin.current-balance b').innerHTML = newBalance;
                }
                if (document.querySelector('.my-reward-points b')) {
                    document.querySelector('.my-reward-points b').innerHTML = `Points: ${newBalance}`
                }
                setCookie('balance', newBalance);
            }
            setRedeemvoucher(res.data.data.newData.generateCode)
            setProducthandle(res.data.data.newData.handle)
            setLoader(false)
            setPopup(false);
            getredeemlist(token)
            rewardlist(token)
        }
    }
    const handlebackbutton = () => {
        setPopup(false)
        if (document.querySelector(".aapharamcy-membership-container.widget-page")) {
            document.querySelector(".aapharamcy-membership-container.widget-page").style.display = "block"
            document.getElementById("howtoredeem").style.display = "block"
            document.querySelector(".aapharamcy-membership-container.widget-page #freeproductwidget").style.display = "none"
            document.querySelector('.voucher-floating-icon-container').classList.add('voucher-floating-icon-custom-height');
        }
    }
    const handleproductvouhcer = () => {
        if (redeemused) {

            const data = { ...redeemdata }
            data.redeemid = redeemid
            data.redeemused = redeemused
            setPopup(true)
            setreemdata(data)
        } else {
            if (document.getElementById("freeproductwidget")) {
                document.getElementById("freeproductwidget").style.display = "none"
                if (document.querySelector('#productvoucher')) document.querySelector('#productvoucher').style.display = 'block'
                document.querySelector('.voucher-floating-icon-container').classList.add('voucher-floating-icon-custom-height');
            }
            if (getCookie('access_token')) {
                redeemvouchercode(getCookie('access_token'))
            } else {
                generateToken(1);
            }
        }

    }

    const Continuepopup = () => {
        if (document.getElementById("freeproductwidget")) {
            document.getElementById("freeproductwidget").style.display = "none"
            if (document.querySelector('#productvoucher')) document.querySelector('#productvoucher').style.display = 'block'
            document.querySelector('.voucher-floating-icon-container').classList.add('voucher-floating-icon-custom-height');
        }
        if (getCookie('access_token')) {
            redeemvouchercode(getCookie('access_token'));
        } else {
            generateToken(1);
        }
    }
    return (
        <>
            <div style={{ display: "none" }} id='freeproductwidget'>
                <Titlebanner title={redeemtitle} id={'freeShipTitle'} handleclick={() => handlebackbutton()} />
                <div className="aapharamcy-member-card mt-3">
                    <div className='d-flex align-items-center gap-3 p-4 pt-2 pb-2'>
                        <div className='aapharamcy-reward-icon'>
                            <img src={freeproduct} alt='img' className='d-inline' />
                        </div>
                        <div className='aapharamcy-earn-content text-start'>
                            <h3 className='m-0 fw-normal text-overflow-manage'>{producttitle}</h3>
                            <p className='mb-0'> {`${pointcost} Ponits`}</p>
                        </div>

                    </div>
                    <div className='p-4 pt-2 pb-2'>
                        <p className='m-0 fw-normal '>{` Reward only applies to ${producttitle}`}</p>
                    </div>
                    <div className='aapharamcy-member-free-shi-coupon'>
                        <button className='aapharamcy-join-btn my-2' onClick={() => handleproductvouhcer()}>Redeem</button>
                    </div>
                </div>
                <ToastContainer
                    position="bottom-center"
                    autoClose={2000}
                    hideProgressBar={true}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />
            </div>
            {popup &&
                <div className="popupcard" id='popcard'>
                    <div className='aapharamcy-member-signin'>
                        <p className='p-0 m-2 text-start'>You already have a reward available. Only one can be used per order - are you sure you want to redeem another reward?</p>
                    </div>
                    <div className='d-flex justify-content-center align-items-stretch mt-3'>
                        <button className='aapharamcy-cancel-btn me-2' onClick={() => setPopup(false)}>Cancel</button>
                        <button className='aapharamcy-join-btn how-toredeem-continue pad-12' onClick={() => Continuepopup()}>Continue</button>
                    </div>
                </div>
            }
            <Freeproductvoucher id={'productvoucher'} redeemtitle={redeemtitle} redeemvoucher={redeemvoucher} className={'productvoucher'} loader={loader} pointcost={pointcost} producttitle={producttitle} producthandle={producthandle} message={message} />
        </>

    )
}

export default Freeproductwidget
