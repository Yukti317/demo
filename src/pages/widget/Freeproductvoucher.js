import React, { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { setCookie } from '../../helper/commonFunction';
import { Spinner } from '@shopify/polaris';
import Titlebanner from './Titlebanner';
import clipIcon from '../../assets/img/coupon-code-icon.svg';
import freeproduct from '../../assets/img/place_order.png';

function Freeproductvoucher({ redeemvoucher, loader, redeemtitle, id, className, pointcost, producttitle, producthandle, message }) {
    const [loading, setloading] = useState(false)
    const notify = (message) => {
        const id = toast.success(message, {
            position: "bottom-center",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: 1,
            theme: "dark",
        })
        setTimeout(() => {
            toast.dismiss(id)
        }, 2000);
    };
    const handlebackbutton = () => {
        if (document.querySelector(".aapharamcy-membership-container.widget-page")) {
            document.getElementById("howtoredeem").style.display = "block"
            document.querySelector(".aapharamcy-membership-container.widget-page").style.display = "block"
            if (document.getElementById("productvoucher")) document.getElementById("productvoucher").style.display = "none"
            document.querySelector('.voucher-floating-icon-container').classList.add('voucher-floating-icon-custom-height');
        }
    }
    async function copyClipBoard(voucherCode) {
        var copyText = voucherCode;
        try {
            await navigator.clipboard.writeText(copyText);
            notify('Code copied to clipboard!');

        } catch (err) {
            notify('Failed to copy!');
        }
    }

    const handleAplly = async () => {
        setloading(true)
        await fetch(`/discount/${redeemvoucher}`).then((res) => {
            return res.text();
        }).then(async (res) => {
            setCookie('rewardVoucherCode', redeemvoucher, 0)
            window.open(`https://aapharmacy.com.my/products/${producthandle}`)
            setloading(false)
        })
    }
    return (
        <div style={{ display: "none" }} className={className} id='productvoucher'>
            <Titlebanner title={!loader ? redeemtitle : ''} handleclick={() => handlebackbutton()} />
            {!loader ? <>
                {message !== 'your point is not enough for this redeem' ?
                    <div className="aapharamcy-member-card mt-3">
                        <div className='d-flex align-items-center gap-3 p-4 pt-2 pb-2'>
                            <div className='aapharamcy-reward-icon'>
                                <img src={freeproduct} alt='img' className='d-inline' />
                            </div>
                            <div className='aapharamcy-earn-content text-start'>
                                <h3 className='m-0 fw-normal text-overflow-manage'>{producttitle}</h3>
                                <p className='mb-0'> {`Spent ${pointcost} Ponits`}</p>
                            </div>

                        </div>

                        <div className='p-4 pt-2 pb-2'>
                            <p className='m-0 fw-normal '> Use this discount code on your next order</p>
                        </div>
                        <div className='aapharamcy-member-free-shi-coupon'>
                            <div className='voucher-card-copy-input mb-2'>
                                <div className="d-flex justify-content-between align-items-center w-100">
                                    <p className='m-0 p-0'>{redeemvoucher && redeemvoucher}</p>
                                    <div className='voucher-clipboard-icon' onClick={() => { copyClipBoard(redeemvoucher) }}>
                                        <img src={clipIcon} className='clipboard-icon' alt='copy-clipBoard-img' />
                                    </div>
                                </div>
                            </div>
                            <div className='p-4 pt-2 pb-2'>
                                <p className='m-0 fw-normal '> {`Reward only applies to ${producttitle}`}</p>
                            </div>
                            <button className='aapharamcy-join-btn my-2' onClick={() => { handleAplly() }}>{!loading ? "Show Product" : <div className='btnspinner'><Spinner size='small' /></div>}</button>
                        </div>
                    </div> : <div className='no-record-for-redeemandearn p-3'>your point is not enough for this redeem!</div>}
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
            </> : <div className='widgetspinner'> <Spinner /></div>}

        </div>
    )
}

export default Freeproductvoucher
